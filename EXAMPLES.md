# RemoteFlow Usage Examples

This document provides real-world examples of how to use RemoteFlow to automate your remote work workflows.

## Daily Standup Automation

### Scenario: Morning Standup Report

Every morning at 9 AM, generate and post your standup to Slack:

```bash
# Generate standup from yesterday
npm run dev standup --slack "#team-standup"
```

**Output in Slack:**
```
*Daily Standup - Feb 4, 2026*

*Yesterday:*
• Pushed 8 commits across 2 repo(s)
  - Add user authentication flow
  - Fix login redirect bug
  - Update API documentation
  ...and 5 more

*Pull Requests:*
✅ #145: Add dark mode support
🔄 #147: Refactor database queries

*Assigned Issues (3):*
• #234: Implement password reset
• #235: Add email verification
• #236: Fix mobile layout
```

### Scenario: Weekly Summary

Every Friday, create a summary of the entire week:

```bash
npm run dev standup --days 5
```

This generates a comprehensive report of all commits, PRs, and issues from the past 5 days.

## Status Management

### Scenario: Start Your Workday

```bash
# Set working status at 9 AM
npm run dev status working
```

### Scenario: Joining a Meeting

```bash
# Set meeting status for 30 minutes
npm run dev status meeting --duration 30
```

After 30 minutes, your status automatically clears.

### Scenario: Deep Focus Time

```bash
# Enable DND for 2 hours of focused coding
npm run dev status focus --duration 120
```

This sets your status to "Focus time - DND" and enables Do Not Disturb mode in Slack.

### Scenario: Lunch Break

```bash
# Set lunch status (auto-expires in 1 hour)
npm run dev status lunch
```

### Scenario: End of Day

```bash
# Clear status when logging off
npm run dev status clear
```

### Scenario: Vacation Mode

```bash
# Custom vacation status
npm run dev status custom --text "On vacation until Feb 10" --emoji ":palm_tree:"
```

## GitHub Activity Tracking

### Scenario: Quick Daily Review

Check what you accomplished today:

```bash
# View commits and PRs from today
npm run dev github --commits --prs
```

**Output:**
```
📝 Recent Commits:

a1b2c3d [myorg/frontend]
  Add user authentication flow
e4f5g6h [myorg/backend]
  Implement JWT validation
...

🔀 Pull Requests:

#145 [myorg/frontend] Add dark mode support (merged)
#147 [myorg/backend] Refactor database queries (open)
```

### Scenario: Sprint Review Preparation

Before your sprint review, check all work from the past 2 weeks:

```bash
npm run dev github --commits --prs --issues --days 14
```

### Scenario: Check Your Backlog

See what issues are assigned to you:

```bash
npm run dev github --issues
```

**Output:**
```
🎯 Assigned Issues:

#234 [myorg/frontend] Implement password reset
#235 [myorg/backend] Add email verification
#236 [myorg/mobile] Fix login screen layout
```

## Workflows & Automation Ideas

### Morning Routine

Create a shell script `morning.sh`:

```bash
#!/bin/bash

echo "🌅 Starting your workday..."

# Set working status
npm run dev status working

# Generate standup
npm run dev standup --slack "#team-standup"

# Check assigned issues
npm run dev github --issues

echo "✅ Ready to code!"
```

Run it every morning:
```bash
chmod +x morning.sh
./morning.sh
```

### End of Day Summary

Create `eod.sh`:

```bash
#!/bin/bash

echo "📊 End of day summary..."

# Show today's work
npm run dev github --commits --prs

# Clear status
npm run dev status clear

echo "👋 See you tomorrow!"
```

### Weekly Wrap-up

Create `weekly.sh`:

```bash
#!/bin/bash

echo "📅 Weekly Summary"

# Generate 5-day standup
npm run dev standup --days 5

# Show all PRs from the week
npm run dev github --prs --days 7

echo "🎉 Great week!"
```

### Pre-Meeting Automation

Create `meeting.sh`:

```bash
#!/bin/bash

# Set meeting status for specified duration
DURATION=${1:-30}  # Default 30 minutes

echo "📅 Setting meeting status for $DURATION minutes..."
npm run dev status meeting --duration $DURATION

echo "✅ Status set. Join your meeting!"
```

Usage:
```bash
./meeting.sh 60  # For 60-minute meeting
```

## Integration with Cron Jobs

Automate RemoteFlow with cron:

```bash
# Edit crontab
crontab -e
```

Add entries:

```cron
# Post standup every weekday at 9 AM
0 9 * * 1-5 cd ~/remoteflow && npm run dev standup --slack "#standup"

# Set working status every weekday at 9 AM
0 9 * * 1-5 cd ~/remoteflow && npm run dev status working

# Clear status every weekday at 5 PM
0 17 * * 1-5 cd ~/remoteflow && npm run dev status clear

# Weekly summary every Friday at 4 PM
0 16 * * 5 cd ~/remoteflow && npm run dev standup --days 5 --slack "#weekly-updates"
```

## Advanced Use Cases

### Multi-Team Standup

If you work across multiple teams:

```bash
# Post to team A
npm run dev standup --slack "#team-a-standup"

# Post same standup to team B
npm run dev standup --slack "#team-b-standup"
```

### Custom Standup Format

Generate standup and save to file for customization:

```bash
npm run dev standup > standup.txt

# Edit standup.txt with your notes
# Then post manually or via script
```

### Track Multiple Projects

Check activity across specific repositories:

```bash
# Set GITHUB_REPOS in .env
GITHUB_REPOS=myorg/project1,myorg/project2

npm run dev github --commits --prs
```

## Tips & Tricks

### 1. Shell Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias standup='cd ~/remoteflow && npm run dev standup'
alias work='cd ~/remoteflow && npm run dev status working'
alias meeting='cd ~/remoteflow && npm run dev status meeting --duration'
alias focus='cd ~/remoteflow && npm run dev status focus --duration'
alias afk='cd ~/remoteflow && npm run dev status away'
alias commits='cd ~/remoteflow && npm run dev github --commits'
```

Usage:
```bash
work          # Set working status
meeting 30    # Set 30-min meeting
focus 120     # 2 hours of focus time
standup       # Generate standup
```

### 2. Quick Status Updates

Create keyboard shortcuts in your terminal app:
- `Cmd+1` → `work`
- `Cmd+2` → `meeting 30`
- `Cmd+3` → `focus 90`

### 3. Combine with Other Tools

```bash
# Generate standup and copy to clipboard (macOS)
npm run dev standup | pbcopy

# Post standup and open Slack
npm run dev standup --slack "#standup" && open -a Slack
```

### 4. Custom Status Templates

Create a config file `statuses.json`:

```json
{
  "coding": { "text": "Deep in code", "emoji": ":computer:" },
  "reviewing": { "text": "Reviewing PRs", "emoji": ":eyes:" },
  "debugging": { "text": "Debugging", "emoji": ":bug:" },
  "docs": { "text": "Writing docs", "emoji": ":memo:" }
}
```

Then create a wrapper script to use them.

## Troubleshooting Examples

### Issue: Standup shows no commits

**Solution:** Check date range and GitHub permissions

```bash
# Try longer date range
npm run dev standup --days 3

# Verify GitHub connection
npm run dev github --commits --days 7
```

### Issue: Slack status not updating

**Solution:** Verify token permissions

```bash
# Check if you're using the right token
# User tokens (xoxp-) have different permissions than bot tokens (xoxb-)
# For status updates, you need a user token
```

### Issue: Too many commits in standup

**Solution:** Shorten the time range

```bash
# Only show yesterday's commits
npm run dev standup --days 1
```

---

Have more examples? Contribute them to this document!
