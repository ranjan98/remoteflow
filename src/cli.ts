/* eslint-disable no-case-declarations */
import { Command } from 'commander';
import chalk from 'chalk';
import { config } from './config/index.js';
import { GitHubIntegration } from './integrations/github.js';
import { SlackIntegration } from './integrations/slack.js';
import { StandupGenerator } from './automations/standup-generator.js';
import { StatusUpdater } from './automations/status-updater.js';
import dayjs from 'dayjs';

const program = new Command();

program
  .name('remoteflow')
  .description('Privacy-first automation assistant for remote workers')
  .version('0.1.0');

program
  .command('standup')
  .description('Generate daily standup report')
  .option('-d, --days <number>', 'Number of days to look back', '1')
  .option('-s, --slack <channel>', 'Post to Slack channel')
  .action(async (options) => {
    try {
      if (!config.github.token || !config.github.username) {
        console.error(chalk.red('❌ GitHub token and username are required'));
        console.log(chalk.yellow('Set GITHUB_TOKEN and GITHUB_USERNAME in .env file'));
        process.exit(1);
      }

      const github = new GitHubIntegration(config.github.token, config.github.username);
      const generator = new StandupGenerator(github);

      console.log(chalk.blue('📊 Generating standup report...\n'));

      const since = dayjs().subtract(parseInt(options.days), 'day').toDate();
      const standup = await generator.generate(since);

      console.log(chalk.green('✓ Standup generated!\n'));
      console.log(standup.summary);

      if (options.slack) {
        if (!config.slack.userToken && !config.slack.botToken) {
          console.error(chalk.red('\n❌ Slack token required to post'));
          process.exit(1);
        }

        const slack = new SlackIntegration(config.slack.userToken || config.slack.botToken!);
        const slackMessage = generator.formatForSlack(standup);

        await slack.postMessage(options.slack, slackMessage);
        console.log(chalk.green(`\n✓ Posted to ${options.slack}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Update Slack status')
  .argument('<type>', 'Status type: working, meeting, focus, lunch, away, clear')
  .option('-d, --duration <minutes>', 'Duration in minutes (for temporary status)')
  .option('-t, --text <text>', 'Custom status text')
  .option('-e, --emoji <emoji>', 'Custom emoji (e.g., :rocket:)')
  .action(async (type, options) => {
    try {
      if (!config.slack.userToken && !config.slack.botToken) {
        console.error(chalk.red('❌ Slack token required'));
        console.log(chalk.yellow('Set SLACK_USER_TOKEN or SLACK_BOT_TOKEN in .env file'));
        process.exit(1);
      }

      const slack = new SlackIntegration(config.slack.userToken || config.slack.botToken!);
      const updater = new StatusUpdater(slack);

      const duration = options.duration ? parseInt(options.duration) : undefined;

      console.log(chalk.blue('🔄 Updating Slack status...\n'));

      switch (type.toLowerCase()) {
        case 'working':
          await updater.setWorkingStatus();
          break;
        case 'meeting':
          await updater.setMeetingStatus(duration);
          break;
        case 'focus':
          await updater.setFocusStatus(duration);
          break;
        case 'lunch':
          await updater.setLunchStatus();
          break;
        case 'away':
          await updater.setAwayStatus();
          break;
        case 'clear':
          await updater.clearStatus();
          break;
        case 'custom':
          if (!options.text || !options.emoji) {
            console.error(chalk.red('❌ Custom status requires --text and --emoji'));
            process.exit(1);
          }
          await updater.setCustomStatus(options.text, options.emoji, duration);
          break;
        default:
          console.error(chalk.red(`❌ Unknown status type: ${type}`));
          console.log(chalk.yellow('Available types: working, meeting, focus, lunch, away, clear, custom'));
          process.exit(1);
      }

      console.log(chalk.green('✓ Status updated successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('github')
  .description('View GitHub activity')
  .option('-c, --commits', 'Show recent commits')
  .option('-p, --prs', 'Show pull requests')
  .option('-i, --issues', 'Show assigned issues')
  .option('-d, --days <number>', 'Number of days to look back', '7')
  .action(async (options) => {
    try {
      if (!config.github.token || !config.github.username) {
        console.error(chalk.red('❌ GitHub token and username are required'));
        process.exit(1);
      }

      const github = new GitHubIntegration(config.github.token, config.github.username);
      const since = dayjs().subtract(parseInt(options.days), 'day').toDate();

      if (options.commits) {
        console.log(chalk.blue('📝 Recent Commits:\n'));
        const commits = await github.getRecentCommits(since);
        commits.forEach(c => {
          console.log(chalk.green(`${c.sha}`) + chalk.gray(` [${c.repo}]`));
          console.log(`  ${c.message.split('\n')[0]}`);
        });
      }

      if (options.prs) {
        console.log(chalk.blue('\n🔀 Pull Requests:\n'));
        const prs = await github.getRecentPullRequests(since);
        prs.forEach(pr => {
          const stateColor = pr.state === 'merged' ? chalk.green : pr.state === 'open' ? chalk.yellow : chalk.red;
          console.log(stateColor(`#${pr.number}`) + chalk.gray(` [${pr.repo}] `) + pr.title);
        });
      }

      if (options.issues) {
        console.log(chalk.blue('\n🎯 Assigned Issues:\n'));
        const issues = await github.getAssignedIssues();
        issues.forEach(issue => {
          console.log(chalk.yellow(`#${issue.number}`) + chalk.gray(` [${issue.repo}] `) + issue.title);
        });
      }

      if (!options.commits && !options.prs && !options.issues) {
        console.log(chalk.yellow('Use --commits, --prs, or --issues to view activity'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Calendar command
program
  .command('calendar')
  .description('View today\'s calendar events')
  .option('-u, --upcoming <minutes>', 'Show events in next N minutes', '30')
  .action(async (options) => {
    try {
      if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
        console.error(chalk.red('❌ Google Calendar credentials required'));
        console.log(chalk.yellow('Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env'));
        process.exit(1);
      }

      const { GoogleCalendarIntegration } = await import('./integrations/google-calendar.js');
      const calendar = new GoogleCalendarIntegration(
        config.google.clientId,
        config.google.clientSecret,
        config.google.refreshToken
      );

      if (options.upcoming) {
        console.log(chalk.blue(`📅 Upcoming events (next ${options.upcoming} min):\n`));
        const events = await calendar.getUpcomingEvents(parseInt(options.upcoming));

        if (events.length === 0) {
          console.log(chalk.gray('No upcoming events'));
        } else {
          events.forEach(event => {
            console.log(chalk.green(event.title));
            console.log(`  ${dayjs(event.start).format('h:mm A')} - ${dayjs(event.end).format('h:mm A')}`);
            if (event.meetingUrl) console.log(chalk.blue(`  ${event.meetingUrl}`));
          });
        }
      } else {
        console.log(chalk.blue('📅 Today\'s events:\n'));
        const events = await calendar.getTodayEvents();

        if (events.length === 0) {
          console.log(chalk.gray('No events today'));
        } else {
          events.forEach(event => {
            console.log(chalk.green(event.title));
            console.log(`  ${dayjs(event.start).format('h:mm A')} - ${dayjs(event.end).format('h:mm A')}`);
            if (event.meetingUrl) console.log(chalk.blue(`  ${event.meetingUrl}`));
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Join meeting command
program
  .command('join')
  .description('Join the next calendar meeting')
  .action(async () => {
    try {
      if (!config.google.clientId || !config.google.clientSecret || !config.google.refreshToken) {
        console.error(chalk.red('❌ Google Calendar credentials required'));
        process.exit(1);
      }

      const { GoogleCalendarIntegration } = await import('./integrations/google-calendar.js');
      const { MeetingJoiner } = await import('./automations/meeting-joiner.js');

      const calendar = new GoogleCalendarIntegration(
        config.google.clientId,
        config.google.clientSecret,
        config.google.refreshToken
      );
      const joiner = new MeetingJoiner();

      const currentMeeting = await calendar.getCurrentMeeting();
      if (currentMeeting) {
        console.log(chalk.blue(`Joining current meeting: ${currentMeeting.title}`));
        await joiner.joinMeeting(currentMeeting);
        return;
      }

      const upcoming = await calendar.getUpcomingEvents(5);
      if (upcoming.length > 0) {
        console.log(chalk.blue(`Joining next meeting: ${upcoming[0].title}`));
        await joiner.joinMeeting(upcoming[0]);
      } else {
        console.log(chalk.yellow('No meetings to join'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Time tracking commands
program
  .command('timer <action>')
  .description('Manage time tracking (start, stop, status)')
  .option('-a, --activity <name>', 'Activity name')
  .option('-p, --project <name>', 'Project name')
  .action(async (action, options) => {
    try {
      const { TimeTracker } = await import('./automations/time-tracker.js');
      const tracker = new TimeTracker();

      switch (action.toLowerCase()) {
        case 'start':
          if (!options.activity) {
            console.error(chalk.red('❌ Activity name required'));
            console.log(chalk.yellow('Usage: timer start --activity "Your activity"'));
            process.exit(1);
          }
          await tracker.startTimer(options.activity, options.project);
          break;

        case 'stop':
          const entry = await tracker.stopTimer();
          if (entry) {
            console.log(chalk.green(`✓ Tracked ${Math.round(entry.duration!)} minutes`));
          }
          break;

        case 'status':
          const current = await tracker.getCurrentEntry();
          if (current) {
            const elapsed = Math.floor((Date.now() - current.startTime.getTime()) / 1000 / 60);
            console.log(chalk.blue(`⏱️  Active: ${current.activity}`));
            console.log(chalk.gray(`   Running for ${elapsed} minutes`));
          } else {
            console.log(chalk.gray('No active timer'));
          }

          const totalToday = await tracker.getTotalTimeToday();
          console.log(chalk.blue(`\n📊 Today: ${Math.floor(totalToday / 60)}h ${Math.round(totalToday % 60)}m`));

          const totalWeek = await tracker.getTotalTimeThisWeek();
          console.log(chalk.blue(`   Week: ${Math.floor(totalWeek / 60)}h ${Math.round(totalWeek % 60)}m`));
          break;

        default:
          console.error(chalk.red(`❌ Unknown action: ${action}`));
          console.log(chalk.yellow('Available actions: start, stop, status'));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Analytics command
program
  .command('analytics')
  .description('View weekly analytics')
  .action(async () => {
    try {
      if (!config.github.token || !config.github.username) {
        console.error(chalk.red('❌ GitHub token and username are required'));
        process.exit(1);
      }

      const { AnalyticsGenerator } = await import('./automations/analytics-generator.js');
      const { TimeTracker } = await import('./automations/time-tracker.js');

      const github = new GitHubIntegration(config.github.token, config.github.username);
      const timeTracker = new TimeTracker();
      const analytics = new AnalyticsGenerator(github, timeTracker);

      console.log(chalk.blue('Generating analytics...\n'));
      const data = await analytics.generateWeeklyAnalytics();
      const formatted = analytics.formatAnalytics(data);
      console.log(formatted);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Jira commands
program
  .command('jira')
  .description('View Jira issues')
  .option('-i, --issue <key>', 'Get specific issue')
  .action(async (options) => {
    try {
      if (!config.jira.host || !config.jira.username || !config.jira.apiToken) {
        console.error(chalk.red('❌ Jira credentials required'));
        console.log(chalk.yellow('Set JIRA_HOST, JIRA_USERNAME, and JIRA_API_TOKEN in .env'));
        process.exit(1);
      }

      const { JiraIntegration } = await import('./integrations/jira.js');
      const jira = new JiraIntegration(config.jira.host, config.jira.username, config.jira.apiToken);

      if (options.issue) {
        const issue = await jira.getIssue(options.issue);
        if (issue) {
          console.log(chalk.green(`\n${issue.key}: ${issue.summary}`));
          console.log(chalk.gray(`Status: ${issue.status}`));
          console.log(chalk.blue(issue.url));
        }
      } else {
        console.log(chalk.blue('📋 Your Jira Issues:\n'));
        const issues = await jira.getMyIssues();

        if (issues.length === 0) {
          console.log(chalk.gray('No issues assigned to you'));
        } else {
          issues.forEach(issue => {
            console.log(chalk.green(`${issue.key}: ${issue.summary}`));
            console.log(chalk.gray(`  Status: ${issue.status}`));
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Linear commands
program
  .command('linear')
  .description('View Linear issues')
  .option('-i, --issue <id>', 'Get specific issue')
  .action(async (options) => {
    try {
      if (!config.linear.apiKey) {
        console.error(chalk.red('❌ Linear API key required'));
        console.log(chalk.yellow('Set LINEAR_API_KEY in .env'));
        process.exit(1);
      }

      const { LinearIntegration } = await import('./integrations/linear.js');
      const linear = new LinearIntegration(config.linear.apiKey);

      if (options.issue) {
        const issue = await linear.getIssue(options.issue);
        if (issue) {
          console.log(chalk.green(`\n${issue.title}`));
          console.log(chalk.gray(`State: ${issue.state}`));
          console.log(chalk.blue(issue.url));
        }
      } else {
        console.log(chalk.blue('📋 Your Linear Issues:\n'));
        const issues = await linear.getMyIssues();

        if (issues.length === 0) {
          console.log(chalk.gray('No issues assigned to you'));
        } else {
          issues.forEach(issue => {
            console.log(chalk.green(issue.title));
            console.log(chalk.gray(`  State: ${issue.state}`));
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Dashboard command
program
  .command('dashboard')
  .description('Start web dashboard server')
  .option('-p, --port <number>', 'Port number', config.settings.webDashboardPort.toString())
  .action(async (options) => {
    try {
      if (!config.github.token || !config.github.username) {
        console.error(chalk.red('❌ GitHub token and username are required for analytics'));
        process.exit(1);
      }

      const { DashboardServer } = await import('./dashboard/server.js');
      const { AnalyticsGenerator } = await import('./automations/analytics-generator.js');
      const { TimeTracker } = await import('./automations/time-tracker.js');
      const { AutomationEngine } = await import('./automations/automation-engine.js');

      const github = new GitHubIntegration(config.github.token, config.github.username);
      const timeTracker = new TimeTracker();
      const analytics = new AnalyticsGenerator(github, timeTracker);
      const automationEngine = new AutomationEngine();

      const dashboard = new DashboardServer(analytics, timeTracker, automationEngine);
      dashboard.start(parseInt(options.port));

      console.log(chalk.green(`\n✓ Dashboard available at http://localhost:${options.port}`));
      console.log(chalk.gray('Press Ctrl+C to stop\n'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Automation commands
program
  .command('automation <action>')
  .description('Manage automation rules (start, stop, list)')
  .action(async (action) => {
    try {
      const { AutomationEngine } = await import('./automations/automation-engine.js');
      const engine = new AutomationEngine();

      switch (action.toLowerCase()) {
        case 'start':
          await engine.startEngine();
          console.log(chalk.green('✓ Automation engine started'));
          console.log(chalk.gray('Running in background... Press Ctrl+C to stop'));
          // Keep process running
          process.stdin.resume();
          break;

        case 'stop':
          engine.stopEngine();
          break;

        case 'list':
          const rules = await engine.getRules();
          if (rules.length === 0) {
            console.log(chalk.gray('No automation rules configured'));
            console.log(chalk.yellow('Use the web dashboard to create rules: npm run dev dashboard'));
          } else {
            console.log(chalk.blue('🤖 Automation Rules:\n'));
            rules.forEach(rule => {
              const status = rule.enabled ? chalk.green('✓ enabled') : chalk.gray('✗ disabled');
              console.log(`${status} ${rule.name}`);
              console.log(chalk.gray(`   Trigger: ${rule.trigger}, Actions: ${rule.actions.length}`));
            });
          }
          break;

        default:
          console.error(chalk.red(`❌ Unknown action: ${action}`));
          console.log(chalk.yellow('Available actions: start, stop, list'));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();
