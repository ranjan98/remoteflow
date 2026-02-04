import type { StandupData, GitHubCommit, GitHubPullRequest } from '../types/index.js';
import { GitHubIntegration } from '../integrations/github.js';
import dayjs from 'dayjs';

export class StandupGenerator {
  private github: GitHubIntegration;

  constructor(github: GitHubIntegration) {
    this.github = github;
  }

  async generate(since?: Date): Promise<StandupData> {
    const sinceDate = since || dayjs().subtract(1, 'day').toDate();

    const [commits, pullRequests, issues] = await Promise.all([
      this.github.getRecentCommits(sinceDate),
      this.github.getRecentPullRequests(sinceDate),
      this.github.getAssignedIssues(),
    ]);

    const summary = this.generateSummary(commits, pullRequests);

    return {
      date: dayjs().format('YYYY-MM-DD'),
      commits,
      pullRequests,
      issues,
      summary,
    };
  }

  private generateSummary(commits: GitHubCommit[], prs: GitHubPullRequest[]): string {
    const lines: string[] = [];

    lines.push('## What I did yesterday\n');

    if (commits.length > 0) {
      const repoGroups = this.groupByRepo(commits);
      for (const [repo, repoCommits] of Object.entries(repoGroups)) {
        lines.push(`**${repo}**`);
        repoCommits.forEach(c => {
          lines.push(`  - ${c.message.split('\n')[0]}`);
        });
      }
    } else {
      lines.push('_No commits_');
    }

    lines.push('\n## Pull Requests\n');

    if (prs.length > 0) {
      const openPRs = prs.filter(pr => pr.state === 'open');
      const mergedPRs = prs.filter(pr => pr.state === 'merged');

      if (openPRs.length > 0) {
        lines.push('**Open:**');
        openPRs.forEach(pr => {
          lines.push(`  - [#${pr.number}] ${pr.title} (${pr.repo})`);
        });
      }

      if (mergedPRs.length > 0) {
        lines.push('**Merged:**');
        mergedPRs.forEach(pr => {
          lines.push(`  - [#${pr.number}] ${pr.title} (${pr.repo})`);
        });
      }
    } else {
      lines.push('_No PRs_');
    }

    return lines.join('\n');
  }

  formatForSlack(data: StandupData): string {
    const lines: string[] = [];

    lines.push(`*Daily Standup - ${dayjs(data.date).format('MMM D, YYYY')}*\n`);

    lines.push('*Yesterday:*');
    if (data.commits.length > 0) {
      const repos = new Set(data.commits.map(c => c.repo));
      lines.push(`• Pushed ${data.commits.length} commits across ${repos.size} repo(s)`);

      data.commits.slice(0, 3).forEach(c => {
        lines.push(`  - ${c.message.split('\n')[0]}`);
      });

      if (data.commits.length > 3) {
        lines.push(`  _...and ${data.commits.length - 3} more_`);
      }
    } else {
      lines.push('• No commits');
    }

    if (data.pullRequests.length > 0) {
      lines.push(`\n*Pull Requests:*`);
      data.pullRequests.forEach(pr => {
        const emoji = pr.state === 'merged' ? '✅' : pr.state === 'open' ? '🔄' : '❌';
        lines.push(`${emoji} <${pr.url}|#${pr.number}>: ${pr.title}`);
      });
    }

    if (data.issues.length > 0) {
      lines.push(`\n*Assigned Issues (${data.issues.length}):*`);
      data.issues.slice(0, 3).forEach(issue => {
        lines.push(`• <${issue.url}|#${issue.number}>: ${issue.title}`);
      });
      if (data.issues.length > 3) {
        lines.push(`_...and ${data.issues.length - 3} more_`);
      }
    }

    return lines.join('\n');
  }

  private groupByRepo<T extends { repo: string }>(items: T[]): Record<string, T[]> {
    return items.reduce((acc, item) => {
      if (!acc[item.repo]) {
        acc[item.repo] = [];
      }
      acc[item.repo].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }
}
