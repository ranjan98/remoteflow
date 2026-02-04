import type { AutomationRule, AutomationAction, CalendarEvent } from '../types/index.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { homedir } from 'os';
import * as cron from 'node-cron';
import { SlackIntegration } from '../integrations/slack.js';
import { GoogleCalendarIntegration } from '../integrations/google-calendar.js';
import { MeetingJoiner } from './meeting-joiner.js';
import { StandupGenerator } from './standup-generator.js';
import { TimeTracker } from './time-tracker.js';

interface Database {
  rules: AutomationRule[];
}

export class AutomationEngine {
  private db: Low<Database>;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private slack?: SlackIntegration;
  private calendar?: GoogleCalendarIntegration;
  private meetingJoiner?: MeetingJoiner;
  private standupGenerator?: StandupGenerator;
  private timeTracker?: TimeTracker;

  constructor(
    slack?: SlackIntegration,
    calendar?: GoogleCalendarIntegration,
    meetingJoiner?: MeetingJoiner,
    standupGenerator?: StandupGenerator,
    timeTracker?: TimeTracker
  ) {
    const dbPath = join(homedir(), '.remoteflow', 'automation-rules.json');
    const adapter = new JSONFile<Database>(dbPath);
    this.db = new Low(adapter, { rules: [] });
    this.slack = slack;
    this.calendar = calendar;
    this.meetingJoiner = meetingJoiner;
    this.standupGenerator = standupGenerator;
    this.timeTracker = timeTracker;
  }

  async init(): Promise<void> {
    await this.db.read();
    if (!this.db.data) {
      this.db.data = { rules: [] };
      await this.db.write();
    }
  }

  async addRule(rule: AutomationRule): Promise<void> {
    await this.init();
    this.db.data.rules.push(rule);
    await this.db.write();

    if (rule.enabled && rule.trigger === 'time' && rule.triggerConfig.time) {
      this.scheduleRule(rule);
    }

    console.log(`✓ Rule added: ${rule.name}`);
  }

  async removeRule(ruleId: string): Promise<void> {
    await this.init();
    this.db.data.rules = this.db.data.rules.filter(r => r.id !== ruleId);
    await this.db.write();

    // Cancel scheduled job if exists
    const job = this.scheduledJobs.get(ruleId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(ruleId);
    }

    console.log(`✓ Rule removed: ${ruleId}`);
  }

  async enableRule(ruleId: string): Promise<void> {
    await this.init();
    const rule = this.db.data.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
      await this.db.write();

      if (rule.trigger === 'time' && rule.triggerConfig.time) {
        this.scheduleRule(rule);
      }

      console.log(`✓ Rule enabled: ${rule.name}`);
    }
  }

  async disableRule(ruleId: string): Promise<void> {
    await this.init();
    const rule = this.db.data.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
      await this.db.write();

      const job = this.scheduledJobs.get(ruleId);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(ruleId);
      }

      console.log(`✓ Rule disabled: ${rule.name}`);
    }
  }

  async getRules(): Promise<AutomationRule[]> {
    await this.init();
    return this.db.data.rules;
  }

  async startEngine(): Promise<void> {
    await this.init();

    // Schedule all enabled time-based rules
    for (const rule of this.db.data.rules) {
      if (rule.enabled && rule.trigger === 'time' && rule.triggerConfig.time) {
        this.scheduleRule(rule);
      }
    }

    // Start calendar monitoring for calendar-based rules
    if (this.calendar) {
      this.startCalendarMonitoring();
    }

    console.log('✓ Automation engine started');
  }

  private scheduleRule(rule: AutomationRule): void {
    if (!rule.triggerConfig.time) return;

    const job = cron.schedule(rule.triggerConfig.time, async () => {
      console.log(`Executing rule: ${rule.name}`);
      await this.executeActions(rule.actions);
    });

    this.scheduledJobs.set(rule.id, job);
  }

  private startCalendarMonitoring(): void {
    // Check for upcoming meetings every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.checkCalendarRules();
    });
  }

  private async checkCalendarRules(): Promise<void> {
    if (!this.calendar) return;

    const rules = this.db.data.rules.filter(
      r => r.enabled && r.trigger === 'calendar'
    );

    if (rules.length === 0) return;

    const upcomingEvents = await this.calendar.getUpcomingEvents(5);
    const currentMeeting = await this.calendar.getCurrentMeeting();

    for (const rule of rules) {
      if (rule.triggerConfig.calendarEventType === 'meeting_start' && upcomingEvents.length > 0) {
        await this.executeActions(rule.actions, upcomingEvents[0]);
      } else if (rule.triggerConfig.calendarEventType === 'meeting_end' && currentMeeting) {
        // Check if meeting is ending soon (within 2 minutes)
        const timeUntilEnd = currentMeeting.end.getTime() - Date.now();
        if (timeUntilEnd <= 2 * 60 * 1000 && timeUntilEnd > 0) {
          await this.executeActions(rule.actions);
        }
      }
    }
  }

  private async executeActions(actions: AutomationAction[], event?: CalendarEvent): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'slack_status':
            if (this.slack) {
              await this.slack.updateStatus({
                text: action.config.text as string,
                emoji: action.config.emoji as string,
                expiration: action.config.expiration as number | undefined,
              });
            }
            break;

          case 'join_meeting':
            if (this.meetingJoiner && event) {
              await this.meetingJoiner.joinMeeting(event);
            }
            break;

          case 'post_standup':
            if (this.standupGenerator && this.slack) {
              const standup = await this.standupGenerator.generate();
              const message = this.standupGenerator.formatForSlack(standup);
              const channel = action.config.channel as string;
              await this.slack.postMessage(channel, message);
            }
            break;

          case 'start_timer':
            if (this.timeTracker) {
              await this.timeTracker.startTimer(
                action.config.activity as string,
                action.config.project as string | undefined
              );
            }
            break;

          case 'stop_timer':
            if (this.timeTracker) {
              await this.timeTracker.stopTimer();
            }
            break;
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  stopEngine(): void {
    // Stop all scheduled jobs
    for (const job of this.scheduledJobs.values()) {
      job.stop();
    }
    this.scheduledJobs.clear();
    console.log('✓ Automation engine stopped');
  }
}
