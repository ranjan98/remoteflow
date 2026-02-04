import { google } from 'googleapis';
import type { CalendarEvent } from '../types/index.js';
import dayjs from 'dayjs';

export class GoogleCalendarIntegration {
  private calendar;

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async getTodayEvents(): Promise<CalendarEvent[]> {
    const startOfDay = dayjs().startOf('day').toISOString();
    const endOfDay = dayjs().endOf('day').toISOString();

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay,
        timeMax: endOfDay,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return events.map(event => ({
        id: event.id!,
        title: event.summary || 'No Title',
        start: new Date(event.start?.dateTime || event.start?.date || ''),
        end: new Date(event.end?.dateTime || event.end?.date || ''),
        meetingUrl: this.extractMeetingUrl(event.description || '', event.hangoutLink),
        attendees: event.attendees?.map(a => a.email || '') || [],
        description: event.description || undefined,
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  async getUpcomingEvents(minutes: number = 30): Promise<CalendarEvent[]> {
    const now = new Date();
    const later = dayjs().add(minutes, 'minute').toDate();

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: later.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return events.map(event => ({
        id: event.id!,
        title: event.summary || 'No Title',
        start: new Date(event.start?.dateTime || event.start?.date || ''),
        end: new Date(event.end?.dateTime || event.end?.date || ''),
        meetingUrl: this.extractMeetingUrl(event.description || '', event.hangoutLink),
        attendees: event.attendees?.map(a => a.email || '') || [],
        description: event.description || undefined,
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  private extractMeetingUrl(description: string, hangoutLink?: string | null): string | undefined {
    if (hangoutLink) return hangoutLink;

    // Extract Zoom links
    const zoomMatch = description.match(/https:\/\/[\w-]*\.?zoom\.us\/(j|my)\/[\w?=&-]+/);
    if (zoomMatch) return zoomMatch[0];

    // Extract Teams links
    const teamsMatch = description.match(/https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[\w%?=&-]+/);
    if (teamsMatch) return teamsMatch[0];

    // Extract Google Meet links
    const meetMatch = description.match(/https:\/\/meet\.google\.com\/[\w-]+/);
    if (meetMatch) return meetMatch[0];

    return undefined;
  }

  async getCurrentMeeting(): Promise<CalendarEvent | null> {
    const now = new Date();
    const events = await this.getTodayEvents();

    const currentEvent = events.find(event =>
      event.start <= now && event.end >= now
    );

    return currentEvent || null;
  }
}
