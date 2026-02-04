# RemoteFlow

Privacy-first automation assistant for remote workers. Take control of your daily workflows with automated standups, intelligent status updates, and seamless integrations - all running locally on your machine.

## Why RemoteFlow?

Remote work is productive, but context switching between Slack, GitHub, Jira, and meetings wastes hours every day. RemoteFlow helps you automate the repetitive parts so you can focus on what matters.

### Key Features

#### Core Features
- **Daily Standup Generator** - Automatically generates standup reports from your GitHub activity
- **Smart Status Updates** - One-command Slack status updates (working, meeting, focus, lunch, away)
- **GitHub Activity Tracking** - View commits, PRs, and assigned issues at a glance
- **Privacy-First** - Everything runs locally, you control what data is shared
- **Simple CLI** - No complex setup, just install and run

#### Advanced Features ✨
- **Google Calendar Integration** - Auto-sync with your calendar and detect meeting links
- **Meeting Auto-Joiner** - Automatically join Zoom, Google Meet, and Teams meetings
- **Time Tracking** - Track your work hours with built-in timer and analytics
- **Jira & Linear Integration** - View and manage tickets directly from the CLI
- **Automation Rules Engine** - Create custom workflows with time and calendar triggers
- **Web Dashboard** - Visual analytics dashboard with real-time productivity insights
- **Multi-Timezone Support** - Seamless collaboration across different timezones

## Quick Start

### Prerequisites

- Node.js 22 or higher
- GitHub account
- Slack workspace (optional, for Slack features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/remoteflow.git
cd remoteflow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your tokens
nano .env
```

### Configuration

Edit `.env` with your API tokens:

```bash
# Required for GitHub features
GITHUB_TOKEN=ghp_your_github_token
GITHUB_USERNAME=your-username

# Required for Slack features
SLACK_USER_TOKEN=xoxp-your-user-token

# Optional: Google Calendar integration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Optional: Jira integration
JIRA_HOST=your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Optional: Linear integration
LINEAR_API_KEY=lin_api_your-key

# Optional: For AI-powered features
ANTHROPIC_API_KEY=sk-ant-your-key

# Settings
TIMEZONE=America/New_York
WORK_START_HOUR=9
WORK_END_HOUR=17
ENABLE_AUTO_JOIN=false
ENABLE_TIME_TRACKING=true
WEB_DASHBOARD_PORT=3000
```

#### Getting Tokens

**GitHub Token:**
1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes: `repo`, `read:user`, `user:email`

**Slack User Token:**
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create new app → From scratch
3. Go to OAuth & Permissions
4. Add scopes: `users.profile:write`, `chat:write`, `users.profile:read`
5. Install to workspace
6. Copy the User OAuth Token (starts with `xoxp-`)

### Build & Run

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run built version
npm start
```

## Usage

### Generate Daily Standup

```bash
# Generate standup from yesterday's activity
npm run dev standup

# Look back 3 days
npm run dev standup --days 3

# Post directly to Slack channel
npm run dev standup --slack "#standup"
```

**Output example:**
```
## What I did yesterday

**myorg/myapp**
  - Add user authentication
  - Fix login bug
  - Update README

## Pull Requests

**Open:**
  - [#123] Add dark mode support (myorg/myapp)

**Merged:**
  - [#122] Fix critical bug (myorg/api)
```

### Update Slack Status

```bash
# Set working status
npm run dev status working

# Set meeting status for 30 minutes
npm run dev status meeting --duration 30

# Set focus time (DND)
npm run dev status focus --duration 90

# Set lunch break
npm run dev status lunch

# Set away status
npm run dev status away

# Clear status
npm run dev status clear

# Custom status
npm run dev status custom --text "On vacation" --emoji ":palm_tree:"
```

### View GitHub Activity

```bash
# View recent commits
npm run dev github --commits

# View pull requests
npm run dev github --prs

# View assigned issues
npm run dev github --issues

# Combine multiple views
npm run dev github --commits --prs --issues

# Look back 14 days
npm run dev github --prs --days 14
```

### Calendar & Meetings

```bash
# View today's calendar events
npm run dev calendar

# View upcoming events (next 30 minutes)
npm run dev calendar --upcoming 30

# Join current or next meeting
npm run dev join
```

### Time Tracking

```bash
# Start timer
npm run dev timer start --activity "Writing code" --project "RemoteFlow"

# Stop timer
npm run dev timer stop

# Check timer status and daily/weekly totals
npm run dev timer status
```

### Analytics

```bash
# View weekly productivity analytics
npm run dev analytics
```

### Jira & Linear

```bash
# View your Jira issues
npm run dev jira

# View specific Jira issue
npm run dev jira --issue PROJ-123

# View your Linear issues
npm run dev linear

# View specific Linear issue
npm run dev linear --issue ISSUE-ID
```

### Web Dashboard

```bash
# Start web dashboard
npm run dev dashboard

# Start on custom port
npm run dev dashboard --port 3001
```

Then open http://localhost:3000 in your browser.

### Automation

```bash
# Start automation engine
npm run dev automation start

# List automation rules
npm run dev automation list

# Stop automation engine
npm run dev automation stop
```

## Features in Detail

### Standup Generator

Automatically creates standup reports by:
- Fetching your commits from the last N days
- Grouping commits by repository
- Listing open and merged pull requests
- Showing assigned issues

Perfect for daily standups, weekly updates, or end-of-week summaries.

### Status Updater

One-command status updates save you from:
- Manually updating status before/after meetings
- Forgetting to set DND during focus time
- Inconsistent status messages across the team

All status updates support optional duration with auto-expiration.

### GitHub Integration

Quick visibility into your work:
- What did I commit yesterday?
- Which PRs are still open?
- What issues am I assigned to?

No more switching between browser tabs.

### Google Calendar Integration

Seamlessly sync with your calendar:
- View today's schedule and upcoming meetings
- Auto-detect meeting links (Zoom, Google Meet, Teams)
- Get meeting notifications
- Calendar-based automation triggers

### Meeting Auto-Joiner

Never be late to meetings again:
- Automatically detect meeting links from calendar
- Support for Zoom, Google Meet, Microsoft Teams
- Opens with native app or falls back to browser
- Can be triggered manually or via automation rules

### Time Tracking & Analytics

Track your productivity:
- Start/stop timers for activities and projects
- View daily and weekly time summaries
- Analyze most productive hours
- Integrate GitHub activity with time tracking
- Export analytics to dashboard

### Jira & Linear Integration

Manage tickets without leaving the terminal:
- View all assigned issues
- Check issue details and status
- Transition issues between states
- Create new tickets
- Sync with GitHub activity in standups

### Automation Rules Engine

Create powerful workflows:
- **Time triggers**: Schedule actions with cron syntax
- **Calendar triggers**: React to meeting start/end
- **Actions**: Update Slack status, join meetings, post standups, track time
- **Examples**:
  - Auto-join meetings 2 minutes before they start
  - Set "In a meeting" status when calendar event begins
  - Post daily standup at 9 AM every weekday
  - Start time tracker at work hours

### Web Dashboard

Visual productivity insights:
- Real-time analytics charts
- Weekly activity breakdown
- Time tracking controls
- Automation rules management
- GitHub activity visualization
- Responsive design for mobile/desktop

### Multi-Timezone Support

Work with distributed teams:
- Timezone-aware scheduling
- Convert times across timezones
- Check team member availability
- Respect work hours in different regions

## Roadmap

###  Implemented

- [x] **Google Calendar integration** - Auto-sync with calendar and detect meeting links
- [x] **Meeting auto-joiner** - Automatically join Zoom, Google Meet, and Teams meetings
- [x] **Time tracking and analytics** - Built-in timer with productivity analytics
- [x] **Jira/Linear ticket sync** - View and manage tickets from the CLI
- [x] **Customizable automation rules** - Time and calendar-based triggers with custom actions
- [x] **Web dashboard** - Visual analytics dashboard with real-time insights
- [x] **Multi-timezone team support** - Timezone-aware scheduling and collaboration

### Potential Features

- [ ] AI-powered standup summaries (using Claude)
- [ ] Desktop app with system tray
- [ ] Browser extension
- [ ] Mobile app for on-the-go updates
- [ ] Team collaboration features
- [ ] Plugin system for custom integrations
- [ ] Notification system for automation events
- [ ] Export analytics to CSV/PDF

## Architecture

```
remoteflow/
├── src/
│   ├── integrations/         # Third-party service integrations
│   │   ├── github.ts         # GitHub API client
│   │   ├── slack.ts          # Slack API client
│   │   ├── google-calendar.ts # Google Calendar API
│   │   ├── jira.ts           # Jira API client
│   │   └── linear.ts         # Linear API client
│   ├── automations/          # Automation features
│   │   ├── standup-generator.ts
│   │   ├── status-updater.ts
│   │   ├── meeting-joiner.ts # Auto-join meetings
│   │   ├── time-tracker.ts   # Time tracking
│   │   ├── analytics-generator.ts # Analytics reports
│   │   └── automation-engine.ts # Rules engine
│   ├── dashboard/            # Web dashboard
│   │   └── server.ts         # Express server
│   ├── utils/                # Utilities
│   │   └── timezone.ts       # Timezone helpers
│   ├── types/                # TypeScript type definitions
│   ├── config/               # Configuration management
│   ├── cli.ts                # CLI interface
│   └── index.ts              # Entry point
├── .env.example              # Environment template
├── package.json
└── tsconfig.json
```

## Contributing

Contributions are welcome! This project is designed to help remote workers be more productive.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Ideas for Contributions

- Add new integrations (Google Calendar, Notion, Jira, etc.)
- Improve AI-powered features
- Add tests
- Improve documentation
- Fix bugs
- Add new automation workflows

## Privacy & Security

RemoteFlow is designed with privacy as a core principle:

- **Local-first**: All processing happens on your machine
- **You control the data**: Choose what to share and when
- **No telemetry**: We don't collect any usage data
- **Open source**: Audit the code yourself
- **Secure tokens**: Keep your API tokens in `.env` (never committed)

## Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Web Framework**: Express.js
- **APIs**: GitHub REST API, Slack Web API, Google Calendar API, Jira API, Linear API
- **Scheduling**: node-cron
- **Database**: lowdb (local JSON storage)
- **AI**: Anthropic Claude (optional)
- **Build Tool**: TypeScript Compiler

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built for remote workers, by remote workers. Special thanks to the open source community for the amazing tools and libraries that make this possible.

---

**Made with ❤️ for the remote work community**

Star this repo if you find it useful!
