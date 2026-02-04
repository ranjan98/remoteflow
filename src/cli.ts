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

program.parse();
