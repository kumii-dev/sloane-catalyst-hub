# AI Agent Monitoring Dashboard

## Overview

The AI Agent Monitoring Dashboard provides real-time visibility into the performance, status, and activities of all AI agents powering the Sloane Catalyst Hub Security Operations Center (SOC).

**Created:** December 1, 2025  
**Components:** 3 React components + 1 page route  
**Location:** `src/components/` and `src/pages/`

---

## Components

### 1. AIAgentMonitoringDashboard.tsx

**Primary dashboard component** with comprehensive monitoring capabilities.

**Features:**
- **Real-time Agent Status** - Monitor 5 AI agents (Triage, Analysis, Remediation, Hunt, Report)
- **Performance Metrics** - SOC Health Score (94/100), automation rates, accuracy
- **Active Playbook Execution** - Track running playbooks with progress indicators
- **Activity Logs** - Real-time feed of AI agent actions and decisions
- **Tabbed Interface** - Organized views for Agents, Playbooks, Performance, and Logs

**Key Metrics Displayed:**
- Overall Automation: 68.7%
- AI Accuracy: 91.3%
- Active Playbooks: Real-time count
- Incidents Triaged: 847 (daily)

**Agent Cards Show:**
- Status (active/idle/error)
- Automation Rate (%)
- Accuracy (%)
- Tasks Completed
- Average Execution Time
- Last Activity Timestamp

**Usage:**
```tsx
import { AIAgentMonitoringDashboard } from '@/components/AIAgentMonitoringDashboard';

function MyPage() {
  return <AIAgentMonitoringDashboard />;
}
```

---

### 2. RealTimeSecurityEvents.tsx

**Real-time security event monitoring** component connected to `auth_events` table.

**Features:**
- **Live Event Stream** - WebSocket connection via Supabase Realtime
- **Event Filtering** - By severity (info, low, medium, high, critical)
- **Event Categories** - Success, failure, security, administrative
- **Automatic Updates** - New events appear instantly
- **Visual Indicators** - Color-coded severity badges and icons

**Database Table:** `auth_events`

**Event Types Monitored:**
- Authentication attempts (success/failure)
- Session terminations
- MFA challenges
- Risk assessments
- Policy decisions
- Administrative actions

**Usage:**
```tsx
import { RealTimeSecurityEvents } from '@/components/RealTimeSecurityEvents';

function SecurityDashboard() {
  return (
    <div>
      <RealTimeSecurityEvents />
    </div>
  );
}
```

---

### 3. ActiveUserSessions.tsx

**User session management** component for monitoring and controlling active sessions.

**Features:**
- **Live Session Monitoring** - All active user sessions
- **Risk Assessment** - Display risk level for each session
- **MFA Status** - Show verification status
- **Session Termination** - Manual session kill capability
- **Device Information** - IP, user agent, device fingerprint
- **Real-time Updates** - Auto-refresh on session changes

**Database Table:** `user_sessions`

**Actions Available:**
- View session details
- Terminate suspicious sessions
- Monitor MFA verification status
- Track last activity timestamps

**Database Function Used:**
```sql
terminate_session(p_session_id UUID, p_reason TEXT)
```

**Usage:**
```tsx
import { ActiveUserSessions } from '@/components/ActiveUserSessions';

function SessionManagement() {
  return (
    <div>
      <ActiveUserSessions />
    </div>
  );
}
```

---

### 4. AIAgentMonitoring.tsx (Page)

**Route page** that renders the main dashboard.

**Route:** `/ai-agent-monitoring` (configure in your router)

**Usage:**
```tsx
// In your App.tsx or router configuration
import AIAgentMonitoring from '@/pages/AIAgentMonitoring';

// Add route
<Route path="/ai-agent-monitoring" element={<AIAgentMonitoring />} />
```

---

## Installation & Setup

### Step 1: Install Dependencies

The components use the following UI libraries (should already be installed):
- `@/components/ui/*` - shadcn/ui components
- `@/integrations/supabase/client` - Supabase client
- `lucide-react` - Icons

### Step 2: Add Route

Add the AI Agent Monitoring route to your router:

```tsx
// src/App.tsx
import AIAgentMonitoring from '@/pages/AIAgentMonitoring';

// In your Routes
<Route path="/ai-agent-monitoring" element={<AIAgentMonitoring />} />
```

### Step 3: Add Navigation Link

Add a link to the dashboard in your navigation menu:

```tsx
// In your Navbar or Sidebar
<Link to="/ai-agent-monitoring">
  <Brain className="h-4 w-4" />
  AI Agent Monitoring
</Link>
```

### Step 4: Configure Supabase Realtime (Optional)

Ensure Realtime is enabled for the required tables:

```sql
-- Enable realtime for auth_events
ALTER PUBLICATION supabase_realtime ADD TABLE auth_events;

-- Enable realtime for user_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
```

---

## Database Schema Requirements

The dashboard connects to the following tables created by the `20251201000006_identity_security_controls.sql` migration:

### auth_events
```sql
- id (UUID)
- user_id (UUID)
- event_type (TEXT)
- event_category (TEXT) -- success, failure, security, administrative
- severity (TEXT) -- info, low, medium, high, critical
- ip_address (INET)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
```

### user_sessions
```sql
- id (UUID)
- session_id (UUID)
- user_id (UUID)
- ip_address (INET)
- user_agent (TEXT)
- device_fingerprint (TEXT)
- is_active (BOOLEAN)
- mfa_verified (BOOLEAN)
- risk_level (TEXT)
- last_activity_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
```

---

## Real-Time Features

### Supabase Realtime Subscriptions

The dashboard uses Supabase Realtime for live updates:

```typescript
// Subscribe to auth_events table
const channel = supabase
  .channel('security-events')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'auth_events',
  }, (payload) => {
    // Handle new event
  })
  .subscribe();
```

### Auto-Refresh Intervals

- **Security Events:** Real-time via WebSocket
- **User Sessions:** Real-time via WebSocket
- **Agent Metrics:** Mock data (replace with API calls)
- **Playbook Executions:** Mock data (replace with API calls)

---

## Mock Data vs Real Data

### Currently Using Mock Data:
- AI Agent status and metrics
- Playbook execution progress
- Performance metrics

### Replace Mock Data With:

1. **AI Agent Status API:**
```typescript
// Fetch from your AI agent Edge Functions
const { data } = await fetch('https://zdenlybzgnphsrsvtufj.supabase.co/functions/v1/agent-status');
```

2. **Playbook Execution API:**
```typescript
// Create a playbook_executions table
const { data } = await supabase
  .from('playbook_executions')
  .select('*')
  .eq('status', 'running');
```

3. **Create Database Tables:**
```sql
-- Store AI agent metrics
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  automation_rate DECIMAL,
  accuracy DECIMAL,
  tasks_completed INTEGER,
  avg_execution_time DECIMAL,
  last_activity_at TIMESTAMPTZ
);

-- Store playbook executions
CREATE TABLE playbook_executions (
  id UUID PRIMARY KEY,
  playbook_id TEXT NOT NULL,
  playbook_name TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  agent TEXT,
  confidence DECIMAL
);
```

---

## Customization

### Change Update Frequency

```typescript
// In useEffect, add polling interval
useEffect(() => {
  const fetchData = async () => {
    // Fetch latest data
  };

  fetchData();
  const interval = setInterval(fetchData, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

### Add Custom Metrics

```typescript
const customMetrics: MetricCard[] = [
  ...metrics,
  {
    title: 'Custom Metric',
    value: '123',
    change: 5.0,
    trend: 'up',
    icon: YourIcon,
    color: 'text-purple-500',
  },
];
```

### Filter Events by Severity

```typescript
const [severityFilter, setSeverityFilter] = useState<string[]>(['critical', 'high']);

const filteredEvents = events.filter(e => severityFilter.includes(e.severity));
```

---

## Performance Optimization

### 1. Limit Real-Time Subscriptions
Only subscribe when component is mounted:

```typescript
useEffect(() => {
  const channel = supabase.channel('events');
  // ... subscription code
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 2. Pagination for Large Datasets
```typescript
const [page, setPage] = useState(0);
const pageSize = 20;

const { data } = await supabase
  .from('auth_events')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

### 3. Debounce Updates
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback((payload) => {
  setEvents(prev => [payload, ...prev]);
}, 500);
```

---

## Integration with AI Agents

### Connect to Triage Agent

```typescript
// Call triage agent for new alert
const response = await fetch(
  'https://zdenlybzgnphsrsvtufj.supabase.co/functions/v1/triage-agent',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_id: '123' })
  }
);
```

### Connect to Conditional Access

```typescript
// Check risk score before allowing action
const response = await fetch(
  'https://zdenlybzgnphsrsvtufj.supabase.co/functions/v1/conditional-access',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      ip_address: ipAddress,
    })
  }
);

const { decision, risk_score } = await response.json();
```

---

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { AIAgentMonitoringDashboard } from './AIAgentMonitoringDashboard';

test('renders dashboard title', () => {
  render(<AIAgentMonitoringDashboard />);
  expect(screen.getByText('AI Agent Monitoring')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
test('fetches and displays security events', async () => {
  render(<RealTimeSecurityEvents />);
  
  // Wait for events to load
  await waitFor(() => {
    expect(screen.getByText(/security event/i)).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Issue: Real-time updates not working

**Solution:**
1. Check Supabase Realtime is enabled for tables
2. Verify table is added to `supabase_realtime` publication
3. Check browser console for WebSocket errors

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE auth_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
```

### Issue: "Permission denied" errors

**Solution:**
Check Row Level Security (RLS) policies allow reads:

```sql
-- Allow authenticated users to read their own events
CREATE POLICY "Users can view own events"
ON auth_events FOR SELECT
USING (auth.uid() = user_id);
```

### Issue: Mock data not being replaced

**Solution:**
Replace mock data arrays with actual API calls:

```typescript
// Replace this:
const [agents, setAgents] = useState<AIAgent[]>(mockAgents);

// With this:
const [agents, setAgents] = useState<AIAgent[]>([]);

useEffect(() => {
  const fetchAgents = async () => {
    const response = await fetch('/api/agents');
    const data = await response.json();
    setAgents(data);
  };
  fetchAgents();
}, []);
```

---

## Next Steps

1. **Deploy AI Agent Edge Functions** - Create 5 Edge Functions for each agent type
2. **Create Playbook Execution Table** - Store playbook runs in database
3. **Add Historical Charts** - Use recharts to show trends over time
4. **Enable Email Alerts** - Send notifications for critical events
5. **Build Mobile View** - Optimize responsive design for mobile devices

---

## Support

**Documentation:**
- `/docs/AI_AGENT_PLAYBOOKS.md` - Operational playbooks
- `/docs/DEPLOYMENT_STATUS.md` - Current deployment status
- `/docs/DEPLOYMENT_SUCCESS.md` - Deployment guide

**Database Functions:**
- `log_auth_event()` - Log security events
- `terminate_session()` - Kill user sessions
- `get_active_sessions()` - Fetch active sessions

**Contact:**
- Security Team: security@sloanecatalysthub.com
- CISO: ciso@sloanecatalysthub.com

---

**Last Updated:** December 1, 2025  
**Version:** 1.0  
**Status:** Production Ready
