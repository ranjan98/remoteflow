import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const ConfigSchema = z.object({
  slack: z.object({
    botToken: z.string().optional(),
    userToken: z.string().optional(),
  }),
  github: z.object({
    token: z.string().optional(),
    username: z.string().optional(),
  }),
  anthropic: z.object({
    apiKey: z.string().optional(),
  }),
  settings: z.object({
    timezone: z.string().default('UTC'),
    workStartHour: z.number().default(9),
    workEndHour: z.number().default(17),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export const config: Config = ConfigSchema.parse({
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    userToken: process.env.SLACK_USER_TOKEN,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  settings: {
    timezone: process.env.TIMEZONE,
    workStartHour: process.env.WORK_START_HOUR
      ? parseInt(process.env.WORK_START_HOUR, 10)
      : undefined,
    workEndHour: process.env.WORK_END_HOUR
      ? parseInt(process.env.WORK_END_HOUR, 10)
      : undefined,
  },
});
