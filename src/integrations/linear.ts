import { LinearClient } from '@linear/sdk';
import type { LinearIssue } from '../types/index.js';

export class LinearIntegration {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async getMyIssues(): Promise<LinearIssue[]> {
    try {
      const me = await this.client.viewer;
      const issues = await me.assignedIssues();

      const result: LinearIssue[] = [];
      for (const issue of issues.nodes) {
        const state = await issue.state;
        const assignee = await issue.assignee;
        
        result.push({
          id: issue.id,
          title: issue.title,
          state: state?.name || 'Unknown',
          assignee: assignee?.name,
          url: issue.url,
          updatedAt: issue.updatedAt.toISOString(),
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching Linear issues:', error);
      return [];
    }
  }

  async getIssue(issueId: string): Promise<LinearIssue | null> {
    try {
      const issue = await this.client.issue(issueId);
      const state = await issue.state;
      const assignee = await issue.assignee;

      return {
        id: issue.id,
        title: issue.title,
        state: state?.name || 'Unknown',
        assignee: assignee?.name,
        url: issue.url,
        updatedAt: issue.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching Linear issue ${issueId}:`, error);
      return null;
    }
  }

  async updateIssueState(issueId: string, stateName: string): Promise<boolean> {
    try {
      const states = await this.client.workflowStates();
      const statesList = await Promise.all(
        states.nodes.map(async (s) => ({ id: s.id, name: (await s).name }))
      );
      
      const targetState = statesList.find(
        state => state.name.toLowerCase() === stateName.toLowerCase()
      );

      if (!targetState) {
        console.error(`State "${stateName}" not found`);
        return false;
      }

      await this.client.updateIssue(issueId, {
        stateId: targetState.id,
      });

      console.log(`✓ Issue ${issueId} updated to ${stateName}`);
      return true;
    } catch (error) {
      console.error(`Error updating Linear issue ${issueId}:`, error);
      return false;
    }
  }

  async createIssue(title: string, description?: string, teamId?: string): Promise<LinearIssue | null> {
    try {
      const teams = await this.client.teams();
      const team = teamId
        ? teams.nodes.find(t => t.id === teamId)
        : teams.nodes[0];

      if (!team) {
        console.error('No team found');
        return null;
      }

      const issuePayload = await this.client.createIssue({
        title,
        description,
        teamId: team.id,
      });

      const issue = await issuePayload.issue;

      if (!issue) {
        return null;
      }

      const state = await issue.state;
      const assignee = await issue.assignee;

      return {
        id: issue.id,
        title: issue.title,
        state: state?.name || 'Unknown',
        assignee: assignee?.name,
        url: issue.url,
        updatedAt: issue.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error creating Linear issue:', error);
      return null;
    }
  }
}
