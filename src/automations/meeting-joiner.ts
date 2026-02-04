import type { CalendarEvent } from '../types/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class MeetingJoiner {
  async joinMeeting(event: CalendarEvent): Promise<void> {
    if (!event.meetingUrl) {
      console.log(`No meeting URL found for: ${event.title}`);
      return;
    }

    const url = event.meetingUrl;

    try {
      if (url.includes('zoom.us')) {
        await this.joinZoom(url);
      } else if (url.includes('teams.microsoft.com')) {
        await this.joinTeams(url);
      } else if (url.includes('meet.google.com')) {
        await this.joinGoogleMeet(url);
      } else {
        console.log(`Unknown meeting platform for URL: ${url}`);
        await this.openInBrowser(url);
      }

      console.log(`✓ Joined meeting: ${event.title}`);
    } catch (error) {
      console.error(`Error joining meeting:`, error);
      throw error;
    }
  }

  private async joinZoom(url: string): Promise<void> {
    // Try to open with Zoom app
    try {
      const platform = process.platform;
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "" "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
    } catch (error) {
      console.error('Failed to open Zoom app, opening in browser');
      await this.openInBrowser(url);
    }
  }

  private async joinTeams(url: string): Promise<void> {
    // Try to open with Teams app
    try {
      const platform = process.platform;
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "" "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
    } catch (error) {
      console.error('Failed to open Teams app, opening in browser');
      await this.openInBrowser(url);
    }
  }

  private async joinGoogleMeet(url: string): Promise<void> {
    await this.openInBrowser(url);
  }

  private async openInBrowser(url: string): Promise<void> {
    const platform = process.platform;
    try {
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "" "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
    } catch (error) {
      console.error(`Failed to open browser:`, error);
      throw error;
    }
  }
}
