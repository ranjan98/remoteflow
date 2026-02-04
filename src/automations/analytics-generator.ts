import type { AnalyticsData, DailyStats } from '../types/index.js';
import { GitHubIntegration } from '../integrations/github.js';
import { TimeTracker } from './time-tracker.js';
import dayjs from 'dayjs';

export class AnalyticsGenerator {
  private github: GitHubIntegration;
  private timeTracker: TimeTracker;

  constructor(github: GitHubIntegration, timeTracker: TimeTracker) {
    this.github = github;
    this.timeTracker = timeTracker;
  }

  async generateWeeklyAnalytics(): Promise<AnalyticsData> {
    const startOfWeek = dayjs().startOf('week').toDate();
    const [commits, pullRequests, issues, timeEntries] = await Promise.all([
      this.github.getRecentCommits(startOfWeek),
      this.github.getRecentPullRequests(startOfWeek),
      this.github.getAssignedIssues(),
      this.timeTracker.getWeeklyEntries(),
    ]);

    const repos = new Set(commits.map(c => c.repo));
    const totalTimeTracked = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    // Generate daily stats
    const dailyStats: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const date = dayjs().startOf('week').add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');

      const dayCommits = commits.filter(c =>
        dayjs(c.timestamp).format('YYYY-MM-DD') === dateStr
      );

      const dayPRs = pullRequests.filter(pr =>
        dayjs(pr.url).format('YYYY-MM-DD') === dateStr
      );

      const dayTime = timeEntries
        .filter(entry => entry.date === dateStr)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);

      dailyStats.push({
        date: dateStr,
        commits: dayCommits.length,
        prs: dayPRs.length,
        hoursWorked: dayTime / 60,
      });
    }

    // Calculate most productive hours
    const hourCounts: Record<number, number> = {};
    commits.forEach(commit => {
      const hour = new Date(commit.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostProductiveHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return {
      totalCommits: commits.length,
      totalPRs: pullRequests.length,
      totalIssues: issues.length,
      activeRepos: Array.from(repos),
      timeTracked: totalTimeTracked,
      mostProductiveHours,
      dailyStats,
    };
  }

  formatAnalytics(data: AnalyticsData): string {
    const lines: string[] = [];

    lines.push('📊 Weekly Analytics\n');
    lines.push('─'.repeat(50));

    lines.push(`\n📝 Activity:`);
    lines.push(`  • Commits: ${data.totalCommits}`);
    lines.push(`  • Pull Requests: ${data.totalPRs}`);
    lines.push(`  • Open Issues: ${data.totalIssues}`);
    lines.push(`  • Active Repos: ${data.activeRepos.length}`);

    lines.push(`\n⏱️  Time Tracking:`);
    lines.push(`  • Total Time: ${Math.round(data.timeTracked / 60)} hours ${Math.round(data.timeTracked % 60)} minutes`);

    if (data.mostProductiveHours.length > 0) {
      lines.push(`\n🌟 Most Productive Hours:`);
      data.mostProductiveHours.forEach(hour => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        lines.push(`  • ${displayHour}:00 ${ampm}`);
      });
    }

    lines.push(`\n📅 Daily Breakdown:`);
    data.dailyStats.forEach(stat => {
      if (stat.commits > 0 || stat.prs > 0 || stat.hoursWorked > 0) {
        const day = dayjs(stat.date).format('ddd, MMM D');
        lines.push(`  ${day}: ${stat.commits} commits, ${stat.prs} PRs, ${stat.hoursWorked.toFixed(1)}h`);
      }
    });

    if (data.activeRepos.length > 0) {
      lines.push(`\n📂 Active Repositories:`);
      data.activeRepos.forEach(repo => {
        lines.push(`  • ${repo}`);
      });
    }

    return lines.join('\n');
  }
}
