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
  google: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    refreshToken: z.string().optional(),
  }),
  jira: z.object({
    host: z.string().optional(),
    username: z.string().optional(),
    apiToken: z.string().optional(),
  }),
  linear: z.object({
    apiKey: z.string().optional(),
  }),
  settings: z.object({
    timezone: z.string().default('UTC'),
    workStartHour: z.number().default(9),
    workEndHour: z.number().default(17),
    enableAutoJoin: z.boolean().default(false),
    enableTimeTracking: z.boolean().default(false),
    webDashboardPort: z.number().default(3000),
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
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  jira: {
    host: process.env.JIRA_HOST,
    username: process.env.JIRA_USERNAME,
    apiToken: process.env.JIRA_API_TOKEN,
  },
  linear: {
    apiKey: process.env.LINEAR_API_KEY,
  },
  settings: {
    timezone: process.env.TIMEZONE,
    workStartHour: process.env.WORK_START_HOUR
      ? parseInt(process.env.WORK_START_HOUR, 10)
      : undefined,
    workEndHour: process.env.WORK_END_HOUR
      ? parseInt(process.env.WORK_END_HOUR, 10)
      : undefined,
    enableAutoJoin: process.env.ENABLE_AUTO_JOIN === 'true',
    enableTimeTracking: process.env.ENABLE_TIME_TRACKING === 'true',
    webDashboardPort: process.env.WEB_DASHBOARD_PORT
      ? parseInt(process.env.WEB_DASHBOARD_PORT, 10)
      : undefined,
  },
});
