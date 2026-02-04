import { describe, it, expect, vi } from 'vitest';
import { StatusUpdater } from './status-updater.js';
import type { SlackIntegration } from '../integrations/slack.js';

describe('StatusUpdater', () => {
  it('should set working status', async () => {
    const mockSlack = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SlackIntegration;

    const updater = new StatusUpdater(mockSlack);
    await updater.setWorkingStatus();

    expect(mockSlack.updateStatus).toHaveBeenCalledWith({
      text: 'Working',
      emoji: ':computer:',
    });
  });

  it('should set meeting status with duration', async () => {
    const mockSlack = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SlackIntegration;

    const updater = new StatusUpdater(mockSlack);
    await updater.setMeetingStatus(30);

    expect(mockSlack.updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'In a meeting',
        emoji: ':calendar:',
        expiration: expect.any(Number),
      })
    );
  });

  it('should set focus status', async () => {
    const mockSlack = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SlackIntegration;

    const updater = new StatusUpdater(mockSlack);
    await updater.setFocusStatus();

    expect(mockSlack.updateStatus).toHaveBeenCalledWith({
      text: 'Focus time - DND',
      emoji: ':no_entry:',
    });
  });

  it('should clear status', async () => {
    const mockSlack = {
      clearStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SlackIntegration;

    const updater = new StatusUpdater(mockSlack);
    await updater.clearStatus();

    expect(mockSlack.clearStatus).toHaveBeenCalled();
  });

  it('should set custom status with text and emoji', async () => {
    const mockSlack = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as SlackIntegration;

    const updater = new StatusUpdater(mockSlack);
    await updater.setCustomStatus('On vacation', ':palm_tree:', 120);

    expect(mockSlack.updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'On vacation',
        emoji: ':palm_tree:',
        expiration: expect.any(Number),
      })
    );
  });
});
