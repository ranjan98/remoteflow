import { describe, it, expect, vi } from 'vitest';
import { StandupGenerator } from './standup-generator.js';
import type { GitHubIntegration } from '../integrations/github.js';
import dayjs from 'dayjs';

describe('StandupGenerator', () => {
  it('should generate standup data with commits and PRs', async () => {
    const mockGithub = {
      getRecentCommits: vi.fn().mockResolvedValue([
        {
          sha: 'abc123',
          message: 'Add feature X',
          repo: 'user/repo',
          timestamp: new Date().toISOString(),
          url: 'https://github.com/user/repo/commit/abc123',
        },
      ]),
      getRecentPullRequests: vi.fn().mockResolvedValue([
        {
          number: 123,
          title: 'Fix bug Y',
          repo: 'user/repo',
          state: 'open' as const,
          url: 'https://github.com/user/repo/pull/123',
        },
      ]),
      getAssignedIssues: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubIntegration;

    const generator = new StandupGenerator(mockGithub);
    const standup = await generator.generate();

    expect(standup.date).toBe(dayjs().format('YYYY-MM-DD'));
    expect(standup.commits).toHaveLength(1);
    expect(standup.pullRequests).toHaveLength(1);
    expect(standup.summary).toContain('What I did yesterday');
  });

  it('should format standup data for Slack', () => {
    const mockGithub = {} as GitHubIntegration;
    const generator = new StandupGenerator(mockGithub);

    const standupData = {
      date: '2024-01-15',
      commits: [
        {
          sha: 'abc123',
          message: 'Add feature X',
          repo: 'user/repo',
          timestamp: new Date().toISOString(),
          url: 'https://github.com/user/repo/commit/abc123',
        },
      ],
      pullRequests: [],
      issues: [],
      summary: 'Test summary',
    };

    const slackMessage = generator.formatForSlack(standupData);

    expect(slackMessage).toContain('Daily Standup');
    expect(slackMessage).toContain('Pushed 1 commits');
  });

  it('should handle empty commits gracefully', async () => {
    const mockGithub = {
      getRecentCommits: vi.fn().mockResolvedValue([]),
      getRecentPullRequests: vi.fn().mockResolvedValue([]),
      getAssignedIssues: vi.fn().mockResolvedValue([]),
    } as unknown as GitHubIntegration;

    const generator = new StandupGenerator(mockGithub);
    const standup = await generator.generate();

    expect(standup.commits).toHaveLength(0);
    expect(standup.summary).toContain('No commits');
  });
});
