import type { TimeEntry } from '../types/index.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dayjs from 'dayjs';
import { join } from 'path';
import { homedir } from 'os';

interface Database {
  timeEntries: TimeEntry[];
  currentEntry: TimeEntry | null;
}

export class TimeTracker {
  private db: Low<Database>;

  constructor() {
    const dbPath = join(homedir(), '.remoteflow', 'time-tracking.json');
    const adapter = new JSONFile<Database>(dbPath);
    this.db = new Low(adapter, { timeEntries: [], currentEntry: null });
  }

  async init(): Promise<void> {
    await this.db.read();
    if (!this.db.data) {
      this.db.data = { timeEntries: [], currentEntry: null };
      await this.db.write();
    }
  }

  async startTimer(activity: string, project?: string): Promise<TimeEntry> {
    await this.init();

    // Stop any existing timer
    if (this.db.data.currentEntry) {
      await this.stopTimer();
    }

    const entry: TimeEntry = {
      id: `${Date.now()}`,
      date: dayjs().format('YYYY-MM-DD'),
      startTime: new Date(),
      activity,
      project,
    };

    this.db.data.currentEntry = entry;
    await this.db.write();

    console.log(`✓ Timer started for: ${activity}`);
    return entry;
  }

  async stopTimer(): Promise<TimeEntry | null> {
    await this.init();

    if (!this.db.data.currentEntry) {
      console.log('No active timer');
      return null;
    }

    const entry = this.db.data.currentEntry;
    entry.endTime = new Date();
    entry.duration = (entry.endTime.getTime() - entry.startTime.getTime()) / 1000 / 60; // minutes

    this.db.data.timeEntries.push(entry);
    this.db.data.currentEntry = null;
    await this.db.write();

    console.log(`✓ Timer stopped. Duration: ${Math.round(entry.duration)} minutes`);
    return entry;
  }

  async getCurrentEntry(): Promise<TimeEntry | null> {
    await this.init();
    return this.db.data.currentEntry;
  }

  async getEntries(date?: string): Promise<TimeEntry[]> {
    await this.init();
    const targetDate = date || dayjs().format('YYYY-MM-DD');
    return this.db.data.timeEntries.filter(entry => entry.date === targetDate);
  }

  async getWeeklyEntries(): Promise<TimeEntry[]> {
    await this.init();
    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    return this.db.data.timeEntries.filter(entry =>
      entry.date >= startOfWeek && entry.date <= endOfWeek
    );
  }

  async getTotalTimeToday(): Promise<number> {
    const entries = await this.getEntries();
    return entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }

  async getTotalTimeThisWeek(): Promise<number> {
    const entries = await this.getWeeklyEntries();
    return entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }
}
