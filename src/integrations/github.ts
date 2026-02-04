import { Octokit } from 'octokit';
import type { GitHubCommit, GitHubPullRequest, GitHubIssue } from '../types/index.js';
import dayjs from 'dayjs';

export class GitHubIntegration {
  private octokit: Octokit;
  private username: string;

  constructor(token: string, username: string) {
    this.octokit = new Octokit({ auth: token });
    this.username = username;
  }

  async getRecentCommits(since?: Date): Promise<GitHubCommit[]> {
    const sinceDate = since || dayjs().subtract(1, 'day').toDate();

    try {
      const { data: events } = await this.octokit.rest.activity.listEventsForAuthenticatedUser({
        username: this.username,
        per_page: 100,
      });

      const commits: GitHubCommit[] = [];

      for (const event of events) {
        if (event.type === 'PushEvent' && event.payload && 'commits' in event.payload) {
          const pushPayload = event.payload as { commits: Array<{ sha: string; message: string }> };
          const repo = event.repo.name;

          for (const commit of pushPayload.commits || []) {
            commits.push({
              sha: commit.sha.substring(0, 7),
              message: commit.message,
              repo,
              timestamp: event.created_at || '',
              url: `https://github.com/${repo}/commit/${commit.sha}`,
            });
          }
        }
      }

      return commits.filter(c => new Date(c.timestamp) >= sinceDate);
    } catch (error) {
      console.error('Error fetching GitHub commits:', error);
      return [];
    }
  }

  async getRecentPullRequests(since?: Date): Promise<GitHubPullRequest[]> {
    const sinceDate = since || dayjs().subtract(7, 'day').toDate();

    try {
      const { data: searchResults } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${this.username} type:pr updated:>=${dayjs(sinceDate).format('YYYY-MM-DD')}`,
        sort: 'updated',
        per_page: 50,
      });

      return searchResults.items.map(pr => ({
        number: pr.number,
        title: pr.title,
        repo: pr.repository_url.split('/').slice(-2).join('/'),
        state: pr.state === 'open' ? 'open' : pr.pull_request?.merged_at ? 'merged' : 'closed',
        url: pr.html_url,
      }));
    } catch (error) {
      console.error('Error fetching GitHub PRs:', error);
      return [];
    }
  }

  async getAssignedIssues(): Promise<GitHubIssue[]> {
    try {
      const { data: searchResults } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `assignee:${this.username} type:issue state:open`,
        sort: 'updated',
        per_page: 30,
      });

      return searchResults.items.map(issue => ({
        number: issue.number,
        title: issue.title,
        repo: issue.repository_url.split('/').slice(-2).join('/'),
        state: issue.state as 'open' | 'closed',
        url: issue.html_url,
      }));
    } catch (error) {
      console.error('Error fetching GitHub issues:', error);
      return [];
    }
  }
}
