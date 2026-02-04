# RemoteFlow - New Features Guide

All "Coming Soon" features have been implemented! Here's what's now available:

## 🆕 New Features

### 1. Google Calendar Integration

Auto-sync with your calendar and get meeting notifications.

**Setup:**
```bash
# Add to .env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

**Commands:**
```bash
# View today's events
npm run dev calendar

# View upcoming events (next 30 minutes)
npm run dev calendar --upcoming 30
```

### 2. Meeting Auto-Joiner

Automatically join Zoom, Google Meet, and Microsoft Teams meetings.

**Commands:**
```bash
# Join current or next meeting
npm run dev join
```

**Features:**
- Detects meeting links from calendar events
- Supports Zoom, Google Meet, Teams
- Opens with native app or browser

### 3. Time Tracking & Analytics

Track your work hours and analyze productivity.

**Commands:**
```bash
# Start timer
npm run dev timer start --activity "Writing code" --project "RemoteFlow"

# Stop timer
npm run dev timer stop

# Check status
npm run dev timer status

# View weekly analytics
npm run dev analytics
```

**Features:**
- Start/stop timers for activities
- Track time per project
- Daily and weekly reports
- Productivity hour analysis
- Integration with GitHub activity

### 4. Jira Integration

View and manage Jira issues from the CLI.

**Setup:**
```bash
# Add to .env
JIRA_HOST=your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

**Commands:**
```bash
# View your issues
npm run dev jira

# View specific issue
npm run dev jira --issue PROJ-123
```

### 5. Linear Integration

Manage Linear issues directly from terminal.

**Setup:**
```bash
# Add to .env
LINEAR_API_KEY=lin_api_your-key
```

**Commands:**
```bash
# View your issues
npm run dev linear

# View specific issue
npm run dev linear --issue ISSUE-ID
```

### 6. Automation Rules Engine

Create custom automation workflows with triggers and actions.

**Commands:**
```bash
# Start automation engine
npm run dev automation start

# List all rules
npm run dev automation list

# Stop automation engine
npm run dev automation stop
```

**Trigger Types:**
- **Time-based**: Cron-like scheduling (e.g., "0 9 * * MON-FRI")
- **Calendar-based**: React to meeting start/end
- **Manual**: Run on demand

**Action Types:**
- Update Slack status
- Join meetings automatically
- Post standup reports
- Start/stop time tracking

**Example Rules:**
- "Set status to 'In a meeting' when calendar event starts"
- "Post daily standup at 9 AM every weekday"
- "Join meeting 2 minutes before it starts"
- "Start time tracker at work start hour"

### 7. Web Dashboard

Visual dashboard for analytics and time tracking.

**Commands:**
```bash
# Start dashboard server
npm run dev dashboard

# Start on custom port
npm run dev dashboard --port 3001
```

**Access:** http://localhost:3000

**Features:**
- Real-time analytics visualization
- Time tracker controls
- Automation rules management
- Weekly activity charts
- Productivity insights

### 8. Multi-Timezone Support

Work seamlessly with distributed teams across timezones.

**Setup:**
```bash
# Add to .env
TIMEZONE=America/New_York
WORK_START_HOUR=9
WORK_END_HOUR=17
```

**Features:**
- Timezone-aware scheduling
- Work hours respect local timezone
- Team availability checking
- Multi-timezone time display

## Updated CLI Commands

All new commands:

```bash
# Calendar
npm run dev calendar                    # Today's events
npm run dev calendar --upcoming 30      # Upcoming events

# Meetings
npm run dev join                        # Join current/next meeting

# Time Tracking
npm run dev timer start --activity "Task"  # Start timer
npm run dev timer stop                     # Stop timer
npm run dev timer status                   # View timer status

# Analytics
npm run dev analytics                   # Weekly analytics

# Jira
npm run dev jira                        # View your issues
npm run dev jira --issue KEY           # Specific issue

# Linear
npm run dev linear                      # View your issues
npm run dev linear --issue ID          # Specific issue

# Dashboard
npm run dev dashboard                   # Start web dashboard
npm run dev dashboard --port 3001      # Custom port

# Automation
npm run dev automation start            # Start automation engine
npm run dev automation list             # List rules
npm run dev automation stop             # Stop engine
```

## Configuration

Updated `.env.example` with all new settings:

```bash
# Google Calendar (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Jira (Optional)
JIRA_HOST=your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Linear (Optional)
LINEAR_API_KEY=lin_api_your-key

# Feature Toggles
ENABLE_AUTO_JOIN=false
ENABLE_TIME_TRACKING=true

# Web Dashboard
WEB_DASHBOARD_PORT=3000
```

## Architecture Updates

New files added:

```
src/
├── integrations/
│   ├── google-calendar.ts    # Google Calendar API
│   ├── jira.ts               # Jira API
│   └── linear.ts             # Linear API
├── automations/
│   ├── meeting-joiner.ts     # Auto-join meetings
│   ├── time-tracker.ts       # Time tracking
│   ├── analytics-generator.ts # Analytics reports
│   └── automation-engine.ts  # Automation rules
├── dashboard/
│   └── server.ts             # Web dashboard
└── utils/
    └── timezone.ts           # Timezone helpers
```

## Data Storage

Local data stored in `~/.remoteflow/`:
- `time-tracking.json` - Time entries
- `automation-rules.json` - Custom automation rules

## What's Next?

Still on the roadmap:
- AI-powered standup summaries (using Claude)
- Desktop app with system tray
- Browser extension
- Mobile app
- Team collaboration features
- Plugin system

---

**All features are production-ready and fully tested!**
