export interface StandupData {
  date: string;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  summary: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  repo: string;
  timestamp: string;
  url: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  repo: string;
  state: 'open' | 'closed' | 'merged';
  url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  repo: string;
  state: 'open' | 'closed';
  url: string;
}

export interface AutomationConfig {
  slack: {
    enabled: boolean;
    autoUpdateStatus: boolean;
    standupChannel?: string;
  };
  github: {
    enabled: boolean;
    username: string;
    repos?: string[];
  };
  schedule: {
    standupTime?: string;
    timezone: string;
  };
}

export interface SlackStatus {
  text: string;
  emoji: string;
  expiration?: number;
}
