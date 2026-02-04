import { WebClient } from '@slack/web-api';
import type { SlackStatus } from '../types/index.js';

export class SlackIntegration {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async updateStatus(status: SlackStatus): Promise<void> {
    try {
      await this.client.users.profile.set({
        profile: {
          status_text: status.text,
          status_emoji: status.emoji,
          status_expiration: status.expiration || 0,
        },
      });
      console.log(`✓ Slack status updated: ${status.emoji} ${status.text}`);
    } catch (error) {
      console.error('Error updating Slack status:', error);
      throw error;
    }
  }

  async clearStatus(): Promise<void> {
    try {
      await this.client.users.profile.set({
        profile: {
          status_text: '',
          status_emoji: '',
          status_expiration: 0,
        },
      });
      console.log('✓ Slack status cleared');
    } catch (error) {
      console.error('Error clearing Slack status:', error);
      throw error;
    }
  }

  async postMessage(channel: string, text: string, blocks?: any[]): Promise<void> {
    try {
      await this.client.chat.postMessage({
        channel,
        text,
        blocks,
      });
      console.log(`✓ Message posted to ${channel}`);
    } catch (error) {
      console.error('Error posting to Slack:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const result = await this.client.users.profile.get();
      return result.profile;
    } catch (error) {
      console.error('Error fetching Slack profile:', error);
      throw error;
    }
  }
}
