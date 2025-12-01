# Admin Security Integration Guide

## Overview

The Admin Dashboard has been enhanced with comprehensive security features, including real-time AI agent monitoring, session management, security event tracking, and integrated access to all security operations tools.

**URL:** http://localhost:8080/admin  
**Updated:** December 1, 2025  
**Version:** 2.0

---

## 🎯 New Security Features

### 1. **Security Overview Tab** (New)
Real-time security metrics displayed on the Overview tab:

**Metrics Cards:**
- 🤖 **AI Agents Active**: 5 agents monitoring security operations
- 🔒 **Active Sessions**: Real-time count of active user sessions
- 📊 **Events (24h)**: Authentication and security events in last 24 hours
- ⚠️ **Critical Alerts**: Critical severity events requiring immediate attention

**Quick Links:**
- AI Agents Dashboard
- Security Operations Center
- SIEM Dashboard

---

### 2. **Security Tab** (New)
Dedicated security operations center within admin dashboard.

**Features:**
- ✅ **Real-Time Security Events**: Live feed of authentication events with severity levels
- 🛡️ **Security Operations**: Quick access to SOC, Incident Management, Threat Intelligence
- 📈 **Security Analytics**: SIEM, XDR, and System Status dashboards

**Components Integrated:**
- `RealTimeSecurityEvents` - Live security event stream
- Security operation links with Shield icons
- Color-coded event severity indicators

---

### 3. **AI Agents Tab** (New)
Complete AI agent monitoring dashboard embedded in admin panel.

**Features:**
- 🤖 **5 AI Agents**: Triage, Analysis, Remediation, Hunt, Report
- 📊 **Performance Metrics**: Automation rates (45.2%-78.5%), accuracy (87.4%-96.1%)
- 🎯 **Active Playbooks**: Real-time playbook execution tracking
- 📈 **SOC Health Score**: Overall security operations health (94/100)
- 💰 **Business Impact**: Cost savings, time saved, ROI metrics
- 📝 **Activity Logs**: Agent actions with confidence scores

**Key Metrics Displayed:**
- Overall Automation: 68.7%
- AI Accuracy: 91.3%
- Active Playbooks: Real-time count
- Incidents Triaged: Daily count

---

### 4. **Sessions Tab** (New)
Active user session monitoring and management.

**Features:**
- 👤 **Session Details**: User ID, IP address, device, MFA status
- ⚠️ **Risk Assessment**: Color-coded risk levels (critical/high/medium/low)
- 🔒 **MFA Verification**: Shield icon for verified sessions
- ⏰ **Last Activity**: Real-time activity tracking
- 🛑 **Session Termination**: Manual session kill capability
- 🔄 **Real-Time Updates**: Auto-refresh via Supabase subscriptions

**Actions Available:**
- View session details
- Terminate suspicious sessions
- Monitor MFA compliance
- Track device fingerprints

---

## 📋 Tab Structure

The admin dashboard now has **9 tabs**:

1. **Overview** - Platform metrics + Security overview
2. **Security** (NEW) - Real-time security monitoring
3. **AI Agents** (NEW) - AI agent performance dashboard
4. **Sessions** (NEW) - Active session management
5. **Registrations** - User registration review
6. **Listings** - Marketplace listing approvals
7. **Users** - User management
8. **Financial** - Financial overview
9. **Cohorts** - Cohort management

---

## 🔗 Navigation Links

### From Overview Tab:

**Security Quick Actions:**
```
- AI Agents Dashboard → /ai-agent-monitoring
- Security Operations → /security-operations
- SIEM Dashboard → /siem-dashboard
```

**Traditional Admin Actions:**
```
- Review Registrations → /admin/registrations
- Manage Users → /admin/users
- Mentorship & Advisory → /admin/mentorship
- Financial Overview → /admin/financial
- Manage Cohorts → /admin/cohorts
- System Performance → /admin/performance
```

### From Security Tab:

**Security Operations:**
```
- Security Operations Center → /security-operations
- Incident Management → /incident-management
- Threat Intelligence → /threat-intelligence
```

**Security Analytics:**
```
- SIEM Dashboard → /siem-dashboard
- XDR Dashboard → /xdr-dashboard
- System Status → /system-status
```

---

## 📊 Data Sources

### Security Statistics (Overview Tab)

**Real-Time Queries:**
```typescript
// Active events in last 24 hours
await supabase
  .from("auth_events")
  .select("*", { count: 'exact', head: true })
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

// Active sessions count
await supabase
  .from("user_sessions")
  .select("*", { count: 'exact', head: true })
  .eq("is_active", true);

// Critical alerts in last 24 hours
await supabase
  .from("auth_events")
  .select("*", { count: 'exact', head: true })
  .eq("severity", "critical")
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
```

### Database Tables Used

**Security Tables:**
- `auth_events` - Authentication and security events
- `user_sessions` - Active user sessions
- `auth_context_log` - Authentication context
- `token_fingerprints` - Token security
- `token_usage_events` - Token usage tracking

**Admin Tables:**
- `profiles` - User profiles
- `listings` - Marketplace listings
- `user_roles` - Role-based access control

---

## 🎨 UI Components

### Security Metrics Cards

**Color Scheme:**
```typescript
AI Agents Active    → Blue  (bg-blue-50, text-blue-600)
Active Sessions     → Green (bg-green-50, text-green-600)
Events (24h)        → Purple (bg-purple-50, text-purple-600)
Critical Alerts     → Red   (bg-red-50, text-red-600)
```

### Icons Used

```typescript
import {
  Shield,      // Security operations
  Brain,       // AI agents
  Lock,        // Sessions
  Activity,    // System health
  AlertTriangle, // Critical alerts
  Database,    // SIEM
  Users,       // User management
  Package,     // Listings
  BarChart3,   // Analytics
  UserPlus     // Registrations
} from "lucide-react";
```

---

## 🔐 Access Control

### Admin Access Verification

```typescript
const checkAdminStatus = async () => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (error || !data) {
    toast.error("Access denied. Admin privileges required.");
    navigate("/");
    return;
  }
  
  setIsAdmin(true);
  fetchDashboardData();
};
```

**Required Role:** `admin` in `user_roles` table

---

## 🚀 Usage Guide

### 1. Access Admin Dashboard
```
Navigate to: http://localhost:8080/admin
Requires: Admin role in user_roles table
```

### 2. Monitor Security (Overview Tab)
- View real-time security metrics in colored cards
- Check critical alerts count
- Monitor AI agent status
- Quick access to security dashboards

### 3. View Security Events (Security Tab)
- Real-time feed of auth events
- Color-coded severity levels
- Filter by event type/category
- View event metadata

### 4. Monitor AI Agents (AI Agents Tab)
- View all 5 agent statuses
- Track playbook executions
- Monitor performance metrics
- View activity logs with confidence scores
- Check SOC health score

### 5. Manage Sessions (Sessions Tab)
- View all active sessions
- Check risk levels and MFA status
- Terminate suspicious sessions
- Monitor device information

---

## 🔧 Configuration

### Environment Variables

No additional environment variables needed. Uses existing Supabase configuration:

```env
VITE_SUPABASE_URL=https://zdenlybzgnphsrsvtufj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Permissions

Required RLS policies are already configured in migration:
- `20251201000006_identity_security_controls.sql`

**User Permissions:**
- Regular users: View own events/sessions
- Admins: View all events/sessions/contexts

---

## 📈 Performance Optimization

### Data Fetching Strategy

**On Dashboard Load:**
```typescript
// Fetch in parallel for faster loading
Promise.all([
  fetchPendingListings(),
  fetchUserCount(),
  fetchActiveListingsCount(),
  fetchSecurityStats()
]);
```

**Real-Time Updates:**
- Security events: Supabase Realtime subscriptions
- Sessions: Supabase Realtime subscriptions
- Metrics: Refreshed on tab change

### Caching Strategy

**Client-Side State:**
- Security stats cached until page reload
- Real-time components auto-update via subscriptions
- No manual polling required

---

## 🧪 Testing

### Test Security Features

1. **Generate Test Events:**
```sql
-- Run in Supabase SQL Editor
SELECT log_auth_event(
  auth.uid(),
  'test_login',
  'success',
  'info',
  '192.168.1.100'::inet,
  '{"test": true}'::jsonb
);
```

2. **Create Test Session:**
```sql
INSERT INTO user_sessions (
  session_id, user_id, ip_address, expires_at, is_active, risk_level
) VALUES (
  gen_random_uuid(),
  auth.uid(),
  '192.168.1.100'::inet,
  NOW() + INTERVAL '1 hour',
  true,
  'low'
);
```

3. **Verify Dashboard Updates:**
- Navigate to admin dashboard
- Check Overview tab metrics updated
- Switch to Security tab - see test event
- Switch to Sessions tab - see test session

---

## 🐛 Troubleshooting

### Issue: Security metrics showing 0

**Solution:**
1. Check database tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('auth_events', 'user_sessions');
```

2. Verify RLS policies allow admin access:
```sql
SELECT * FROM user_roles WHERE role = 'admin';
```

3. Check browser console for errors

### Issue: Real-time updates not working

**Solution:**
1. Enable Realtime for tables:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE auth_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
```

2. Check WebSocket connection in browser DevTools
3. Verify Supabase Realtime is enabled in project settings

### Issue: "Access denied" when accessing admin

**Solution:**
1. Add admin role:
```sql
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

2. Clear browser cache and re-login
3. Verify user is authenticated

---

## 📝 Code Examples

### Access Security Stats Programmatically

```typescript
import { supabase } from "@/integrations/supabase/client";

async function getSecurityStats() {
  // Get events count
  const { count: eventsCount } = await supabase
    .from("auth_events" as any)
    .select("*", { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Get active sessions
  const { count: sessionsCount } = await supabase
    .from("user_sessions" as any)
    .select("*", { count: 'exact', head: true })
    .eq("is_active", true);

  return { eventsCount, sessionsCount };
}
```

### Navigate to Security Dashboards

```typescript
import { useNavigate } from "react-router-dom";

function SecurityQuickActions() {
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate("/ai-agent-monitoring")}>
        AI Agents
      </Button>
      <Button onClick={() => navigate("/security-operations")}>
        Security Ops
      </Button>
      <Button onClick={() => navigate("/siem-dashboard")}>
        SIEM
      </Button>
    </div>
  );
}
```

---

## 🔄 Update History

**Version 2.0 - December 1, 2025:**
- ✅ Added Security tab with real-time event monitoring
- ✅ Added AI Agents tab with full monitoring dashboard
- ✅ Added Sessions tab with session management
- ✅ Integrated security metrics in Overview tab
- ✅ Added 4 security metric cards (AI agents, sessions, events, alerts)
- ✅ Added quick links to security dashboards
- ✅ Implemented real-time Supabase subscriptions
- ✅ Added color-coded severity indicators
- ✅ Integrated session termination functionality

**Version 1.0 - Previous:**
- Basic admin dashboard with listing approvals
- User management
- Registration review
- Financial overview
- Cohort management

---

## 📚 Related Documentation

- **AI Agent Dashboard**: `/docs/AI_AGENT_DASHBOARD.md`
- **Database Schema**: `/supabase/migrations/20251201000006_identity_security_controls.sql`
- **Deployment Status**: `/docs/DEPLOYMENT_STATUS.md`
- **AI Agent Playbooks**: `/docs/AI_AGENT_PLAYBOOKS.md`
- **Security Operations**: `/docs/SECOPS_CORE_FUNCTIONS.md`
- **XDR Architecture**: `/docs/XDR_ARCHITECTURE.md`

---

## 🎯 Next Steps

### Recommended Enhancements:

1. **Add Filters to Security Events**
   - Filter by severity, category, date range
   - Export events to CSV

2. **Add Session Analytics**
   - Geographic session distribution
   - Device type breakdown
   - MFA compliance rate

3. **Add Alert Notifications**
   - Email alerts for critical events
   - Browser notifications for new alerts
   - Slack/Teams integration

4. **Add Security Reports**
   - Daily security summary
   - Weekly compliance report
   - Monthly executive dashboard

5. **Add Bulk Session Management**
   - Terminate all sessions for user
   - Terminate sessions by risk level
   - Session activity timeline

---

## 💬 Support

**Issues or Questions?**
- Check browser console for errors
- Review Supabase logs for API issues
- Verify database tables and RLS policies
- Test with sample data first

**Security Concerns?**
- Report critical security issues immediately
- Do not expose sensitive data in logs
- Regularly review access logs
- Monitor for unusual activity patterns

---

**Last Updated:** December 1, 2025  
**Version:** 2.0  
**Status:** Production Ready ✅
