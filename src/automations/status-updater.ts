import { SlackIntegration } from '../integrations/slack.js';
import type { SlackStatus } from '../types/index.js';
import dayjs from 'dayjs';

export class StatusUpdater {
  private slack: SlackIntegration;

  constructor(slack: SlackIntegration) {
    this.slack = slack;
  }

  async setWorkingStatus(): Promise<void> {
    const status: SlackStatus = {
      text: 'Working',
      emoji: ':computer:',
    };
    await this.slack.updateStatus(status);
  }

  async setMeetingStatus(duration?: number): Promise<void> {
    const expiration = duration
      ? dayjs().add(duration, 'minute').unix()
      : undefined;

    const status: SlackStatus = {
      text: 'In a meeting',
      emoji: ':calendar:',
      expiration,
    };
    await this.slack.updateStatus(status);
  }

  async setFocusStatus(duration?: number): Promise<void> {
    const expiration = duration
      ? dayjs().add(duration, 'minute').unix()
      : undefined;

    const status: SlackStatus = {
      text: 'Focus time - DND',
      emoji: ':no_entry:',
      expiration,
    };
    await this.slack.updateStatus(status);
  }

  async setLunchStatus(): Promise<void> {
    const status: SlackStatus = {
      text: 'Lunch break',
      emoji: ':fork_and_knife:',
      expiration: dayjs().add(1, 'hour').unix(),
    };
    await this.slack.updateStatus(status);
  }

  async setAwayStatus(): Promise<void> {
    const status: SlackStatus = {
      text: 'Away',
      emoji: ':palm_tree:',
    };
    await this.slack.updateStatus(status);
  }

  async clearStatus(): Promise<void> {
    await this.slack.clearStatus();
  }

  async setCustomStatus(text: string, emoji: string, duration?: number): Promise<void> {
    const expiration = duration
      ? dayjs().add(duration, 'minute').unix()
      : undefined;

    const status: SlackStatus = {
      text,
      emoji,
      expiration,
    };
    await this.slack.updateStatus(status);
  }
}
