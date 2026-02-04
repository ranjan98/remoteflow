import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface TeamMember {
  name: string;
  timezone: string;
  workStartHour: number;
  workEndHour: number;
}

export class TimezoneHelper {
  static convertToTimezone(date: Date, targetTimezone: string): Date {
    return dayjs(date).tz(targetTimezone).toDate();
  }

  static formatInTimezone(date: Date, targetTimezone: string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).tz(targetTimezone).format(format);
  }

  static isWithinWorkHours(timezone: string, workStartHour: number, workEndHour: number): boolean {
    const now = dayjs().tz(timezone);
    const currentHour = now.hour();
    return currentHour >= workStartHour && currentHour < workEndHour;
  }

  static getTeamWorkingNow(teamMembers: TeamMember[]): TeamMember[] {
    return teamMembers.filter(member =>
      this.isWithinWorkHours(member.timezone, member.workStartHour, member.workEndHour)
    );
  }

  static getNextWorkStart(timezone: string, workStartHour: number): Date {
    const now = dayjs().tz(timezone);
    let nextStart = now.hour(workStartHour).minute(0).second(0);

    if (now.hour() >= workStartHour) {
      nextStart = nextStart.add(1, 'day');
    }

    return nextStart.toDate();
  }

  static formatTimeAcrossTimezones(date: Date, timezones: string[]): string {
    return timezones
      .map(tz => `${tz}: ${this.formatInTimezone(date, tz, 'h:mm A')}`)
      .join(' | ');
  }
}
