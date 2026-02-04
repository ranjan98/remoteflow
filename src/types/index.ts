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

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  meetingUrl?: string;
  attendees?: string[];
  description?: string;
}

export interface TimeEntry {
  id: string;
  date: string;
  startTime: Date;
  endTime?: Date;
  activity: string;
  project?: string;
  duration?: number;
}

export interface AnalyticsData {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  activeRepos: string[];
  timeTracked: number;
  mostProductiveHours: number[];
  dailyStats: DailyStats[];
}

export interface DailyStats {
  date: string;
  commits: number;
  prs: number;
  hoursWorked: number;
}

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  url: string;
  updated: string;
}

export interface LinearIssue {
  id: string;
  title: string;
  state: string;
  assignee?: string;
  url: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'time' | 'calendar' | 'manual';
  triggerConfig: {
    time?: string; // cron format
    calendarEventType?: 'meeting_start' | 'meeting_end' | 'work_hours';
  };
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationAction {
  type: 'slack_status' | 'join_meeting' | 'post_standup' | 'start_timer' | 'stop_timer';
  config: Record<string, unknown>;
}
