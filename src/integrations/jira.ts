import JiraClient from 'jira-client';
import type { JiraIssue } from '../types/index.js';

export class JiraIntegration {
  private client: JiraClient;
  private hostUrl: string;

  constructor(host: string, username: string, apiToken: string) {
    this.hostUrl = host;
    this.client = new JiraClient({
      protocol: 'https',
      host: host,
      username: username,
      password: apiToken,
      apiVersion: '2',
      strictSSL: true,
    });
  }

  async getMyIssues(): Promise<JiraIssue[]> {
    try {
      const searchResults = await this.client.searchJira(
        'assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC',
        {
          maxResults: 50,
          fields: ['summary', 'status', 'assignee', 'updated'],
        }
      );

      return searchResults.issues.map((issue: any) => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName,
        url: `https://${this.hostUrl}/browse/${issue.key}`,
        updated: issue.fields.updated,
      }));
    } catch (error) {
      console.error('Error fetching Jira issues:', error);
      return [];
    }
  }

  async getIssue(issueKey: string): Promise<JiraIssue | null> {
    try {
      const issue = await this.client.findIssue(issueKey);

      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName,
        url: `https://${this.hostUrl}/browse/${issue.key}`,
        updated: issue.fields.updated,
      };
    } catch (error) {
      console.error(`Error fetching Jira issue ${issueKey}:`, error);
      return null;
    }
  }

  async transitionIssue(issueKey: string, transitionName: string): Promise<boolean> {
    try {
      const transitions = await this.client.listTransitions(issueKey);
      const transition = transitions.transitions.find(
        (t: any) => t.name.toLowerCase() === transitionName.toLowerCase()
      );

      if (!transition) {
        console.error(`Transition "${transitionName}" not found for issue ${issueKey}`);
        return false;
      }

      await this.client.transitionIssue(issueKey, {
        transition: { id: transition.id },
      });

      console.log(`✓ Issue ${issueKey} transitioned to ${transitionName}`);
      return true;
    } catch (error) {
      console.error(`Error transitioning issue ${issueKey}:`, error);
      return false;
    }
  }
}
