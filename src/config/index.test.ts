import { describe, it, expect } from 'vitest';
import { config } from './index.js';

describe('Config', () => {
  it('should have required structure', () => {
    expect(config).toHaveProperty('slack');
    expect(config).toHaveProperty('github');
    expect(config).toHaveProperty('anthropic');
    expect(config).toHaveProperty('settings');
  });

  it('should have settings with defaults', () => {
    expect(config.settings).toHaveProperty('timezone');
    expect(config.settings).toHaveProperty('workStartHour');
    expect(config.settings).toHaveProperty('workEndHour');
  });

  it('should have default work hours if not set', () => {
    expect(typeof config.settings.workStartHour).toBe('number');
    expect(typeof config.settings.workEndHour).toBe('number');
  });
});
