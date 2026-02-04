/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
// import type { AnalyticsData } from '../types/index.js';
import { AnalyticsGenerator } from '../automations/analytics-generator.js';
import { TimeTracker } from '../automations/time-tracker.js';
import { AutomationEngine } from '../automations/automation-engine.js';

export class DashboardServer {
  private app: express.Application;
  private analyticsGenerator: AnalyticsGenerator;
  private timeTracker: TimeTracker;
  private automationEngine: AutomationEngine;

  constructor(
    analyticsGenerator: AnalyticsGenerator,
    timeTracker: TimeTracker,
    automationEngine: AutomationEngine
  ) {
    this.app = express();
    this.analyticsGenerator = analyticsGenerator;
    this.timeTracker = timeTracker;
    this.automationEngine = automationEngine;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // Analytics endpoint
    this.app.get('/api/analytics', async (req, res) => {
      try {
        const analytics = await this.analyticsGenerator.generateWeeklyAnalytics();
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    });

    // Time tracking endpoints
    this.app.get('/api/time/current', async (req, res) => {
      try {
        const current = await this.timeTracker.getCurrentEntry();
        res.json(current);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch current timer' });
      }
    });

    this.app.get('/api/time/today', async (req, res) => {
      try {
        const entries = await this.timeTracker.getEntries();
        const total = await this.timeTracker.getTotalTimeToday();
        res.json({ entries, total });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch time entries' });
      }
    });

    this.app.post('/api/time/start', async (req, res) => {
      try {
        const { activity, project } = req.body;
        const entry = await this.timeTracker.startTimer(activity, project);
        res.json(entry);
      } catch (error) {
        res.status(500).json({ error: 'Failed to start timer' });
      }
    });

    this.app.post('/api/time/stop', async (req, res) => {
      try {
        const entry = await this.timeTracker.stopTimer();
        res.json(entry);
      } catch (error) {
        res.status(500).json({ error: 'Failed to stop timer' });
      }
    });

    // Automation rules endpoints
    this.app.get('/api/rules', async (req, res) => {
      try {
        const rules = await this.automationEngine.getRules();
        res.json(rules);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rules' });
      }
    });

    this.app.post('/api/rules', async (req, res) => {
      try {
        const rule = req.body;
        await this.automationEngine.addRule(rule);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to add rule' });
      }
    });

    this.app.delete('/api/rules/:id', async (req, res) => {
      try {
        await this.automationEngine.removeRule(req.params.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to remove rule' });
      }
    });

    this.app.put('/api/rules/:id/enable', async (req, res) => {
      try {
        await this.automationEngine.enableRule(req.params.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to enable rule' });
      }
    });

    this.app.put('/api/rules/:id/disable', async (req, res) => {
      try {
        await this.automationEngine.disableRule(req.params.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to disable rule' });
      }
    });

    // Simple HTML dashboard
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>RemoteFlow Dashboard</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            h1 { color: #333; }
            .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
            .stat { background: #f8f9fa; padding: 15px; border-radius: 6px; }
            .stat-value { font-size: 32px; font-weight: bold; color: #2c3e50; }
            .stat-label { color: #7f8c8d; margin-top: 5px; }
            .timer { background: #e8f5e9; border-left: 4px solid #4caf50; }
            .timer.running { background: #fff3e0; border-left-color: #ff9800; }
            button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
            button:hover { background: #2980b9; }
            button.danger { background: #e74c3c; }
            button.danger:hover { background: #c0392b; }
            .rules-list { list-style: none; padding: 0; }
            .rule-item { background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
            .rule-item.disabled { opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📊 RemoteFlow Dashboard</h1>

            <div class="card">
              <h2>Weekly Analytics</h2>
              <div class="stats" id="analytics"></div>
            </div>

            <div class="card">
              <h2>⏱️ Time Tracker</h2>
              <div id="timer" class="timer"></div>
              <div style="margin-top: 15px;">
                <input type="text" id="activity" placeholder="What are you working on?" style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 4px;">
                <button onclick="startTimer()">Start Timer</button>
                <button onclick="stopTimer()" class="danger">Stop Timer</button>
              </div>
              <div id="today-time" style="margin-top: 15px;"></div>
            </div>

            <div class="card">
              <h2>🤖 Automation Rules</h2>
              <ul class="rules-list" id="rules"></ul>
            </div>
          </div>

          <script>
            async function loadAnalytics() {
              const res = await fetch('/api/analytics');
              const data = await res.json();
              const html = \`
                <div class="stat"><div class="stat-value">\${data.totalCommits}</div><div class="stat-label">Commits</div></div>
                <div class="stat"><div class="stat-value">\${data.totalPRs}</div><div class="stat-label">Pull Requests</div></div>
                <div class="stat"><div class="stat-value">\${data.totalIssues}</div><div class="stat-label">Open Issues</div></div>
                <div class="stat"><div class="stat-value">\${Math.round(data.timeTracked / 60)}h</div><div class="stat-label">Time Tracked</div></div>
              \`;
              document.getElementById('analytics').innerHTML = html;
            }

            async function loadTimer() {
              const res = await fetch('/api/time/current');
              const current = await res.json();
              const timerEl = document.getElementById('timer');

              if (current) {
                const elapsed = Math.floor((Date.now() - new Date(current.startTime).getTime()) / 1000 / 60);
                timerEl.innerHTML = \`<strong>⏱️ Active:</strong> \${current.activity} (\${elapsed} min)\`;
                timerEl.classList.add('running');
              } else {
                timerEl.innerHTML = '<strong>No active timer</strong>';
                timerEl.classList.remove('running');
              }

              const todayRes = await fetch('/api/time/today');
              const todayData = await todayRes.json();
              document.getElementById('today-time').innerHTML = \`<strong>Today:</strong> \${Math.round(todayData.total / 60)}h \${Math.round(todayData.total % 60)}m\`;
            }

            async function startTimer() {
              const activity = document.getElementById('activity').value;
              if (!activity) { alert('Please enter an activity'); return; }
              await fetch('/api/time/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activity }) });
              document.getElementById('activity').value = '';
              loadTimer();
            }

            async function stopTimer() {
              await fetch('/api/time/stop', { method: 'POST' });
              loadTimer();
            }

            async function loadRules() {
              const res = await fetch('/api/rules');
              const rules = await res.json();
              const html = rules.map(rule => \`
                <li class="rule-item \${rule.enabled ? '' : 'disabled'}">
                  <div>
                    <strong>\${rule.name}</strong>
                    <div style="color: #7f8c8d; font-size: 14px;">\${rule.trigger} trigger - \${rule.actions.length} actions</div>
                  </div>
                  <div>
                    <button onclick="toggleRule('\${rule.id}', \${!rule.enabled})">\${rule.enabled ? 'Disable' : 'Enable'}</button>
                    <button class="danger" onclick="deleteRule('\${rule.id}')">Delete</button>
                  </div>
                </li>
              \`).join('');
              document.getElementById('rules').innerHTML = html || '<li>No automation rules configured</li>';
            }

            async function toggleRule(id, enable) {
              await fetch(\`/api/rules/\${id}/\${enable ? 'enable' : 'disable'}\`, { method: 'PUT' });
              loadRules();
            }

            async function deleteRule(id) {
              if (confirm('Delete this rule?')) {
                await fetch(\`/api/rules/\${id}\`, { method: 'DELETE' });
                loadRules();
              }
            }

            // Load data on page load
            loadAnalytics();
            loadTimer();
            loadRules();

            // Refresh timer every 30 seconds
            setInterval(loadTimer, 30000);
          </script>
        </body>
        </html>
      `);
    });
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`✓ Dashboard server running at http://localhost:${port}`);
    });
  }
}
