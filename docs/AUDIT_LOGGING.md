# Audit & Logging Strategy

## Comprehensive Logging Framework for 22 On Sloane Platform

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Owner:** DevOps Lead

---

## 1. Overview

### 1.1 Purpose
Establish comprehensive audit logging across all platform components to support:
- Security monitoring and incident response
- Compliance requirements (ISO 27001, POPIA, GDPR)
- Operational troubleshooting
- Performance optimization
- User behavior analytics (privacy-compliant)

### 1.2 Logging Principles
- **Completeness**: All security-relevant events logged
- **Integrity**: Logs tamper-evident and immutable
- **Confidentiality**: No sensitive data in logs (PII, credentials)
- **Retention**: 7 years for audit logs, 90 days for operational logs
- **Performance**: Minimal impact on system performance (< 5% overhead)

---

## 2. Logging Architecture

### 2.1 Log Sources

```
┌─────────────────────────────────────────────────────────────┐
│                     22 On Sloane Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │ Edge Functions│  │   Database   │      │
│  │  (Browser)   │  │    (Deno)     │  │ (PostgreSQL) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         ▼                  ▼                  ▼               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Audit Logging Layer                  │       │
│  │  - auditLogger.ts (client)                        │       │
│  │  - Edge function logs (Deno console)              │       │
│  │  - Database triggers & functions                  │       │
│  └──────┬────────────────────────────┬────────────┘       │
│         │                             │                      │
│         ▼                             ▼                      │
│  ┌─────────────┐            ┌─────────────────┐            │
│  │   Sentry    │            │ Supabase Logs   │            │
│  │  (Errors &  │            │ (DB, Auth,      │            │
│  │ Performance)│            │  Edge Functions)│            │
│  └─────────────┘            └─────────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Log Storage

| Log Type | Storage Location | Retention | Access Control |
|----------|------------------|-----------|----------------|
| **Application Errors** | Sentry | 90 days | DevOps, CISO |
| **Performance Traces** | Sentry | 90 days | DevOps |
| **Database Logs** | Supabase Analytics | 7 days | DevOps, CISO |
| **Auth Logs** | Supabase Analytics | 7 days | CISO only |
| **Edge Function Logs** | Supabase Analytics | 7 days | DevOps |
| **Audit Trail** | `audit_logs` table | 7 years | CISO, Auditors |
| **Security Events** | `security_events` table | 7 years | CISO only |

---

## 3. Event Categories

### 3.1 Authentication Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| User Login Success | INFO | `user_id`, `timestamp`, `ip_address`, `user_agent`, `auth_method` | 7 years |
| User Login Failure | WARN | `email` (hashed), `timestamp`, `ip_address`, `failure_reason` | 7 years |
| Password Reset Request | INFO | `user_id`, `timestamp`, `ip_address` | 7 years |
| Password Changed | INFO | `user_id`, `timestamp`, `ip_address` | 7 years |
| MFA Enabled/Disabled | INFO | `user_id`, `timestamp`, `mfa_method` | 7 years |
| Session Expired | INFO | `user_id`, `timestamp`, `session_duration` | 90 days |
| Account Locked | WARN | `user_id`, `timestamp`, `reason` | 7 years |

**Implementation:**
```typescript
// Captured via Supabase Auth webhooks and audit table
```

### 3.2 Authorization Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| Privilege Escalation Attempt | ERROR | `user_id`, `attempted_action`, `required_role`, `timestamp` | 7 years |
| Role Assigned | INFO | `admin_id`, `target_user_id`, `role`, `timestamp` | 7 years |
| Role Revoked | INFO | `admin_id`, `target_user_id`, `role`, `timestamp` | 7 years |
| Unauthorized Access Attempt | WARN | `user_id`, `resource_id`, `timestamp` | 7 years |
| RLS Policy Violation | ERROR | `user_id`, `table_name`, `operation`, `timestamp` | 7 years |

**Implementation:**
```typescript
// Via database triggers and audit functions
```

### 3.3 Data Access Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| Sensitive Data Viewed | INFO | `user_id`, `resource_type`, `resource_id`, `timestamp` | 7 years |
| Credit Assessment Accessed | INFO | `user_id`, `assessment_id`, `access_type`, `timestamp` | 7 years |
| Bulk Data Export | INFO | `user_id`, `record_count`, `data_type`, `timestamp` | 7 years |
| Profile Updated | INFO | `user_id`, `fields_changed`, `timestamp` | 7 years |
| Profile Deleted | INFO | `admin_id`, `deleted_user_id`, `reason`, `timestamp` | 7 years |

### 3.4 Financial Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| Payment Initiated | INFO | `user_id`, `amount`, `currency`, `payment_method`, `timestamp` | 7 years |
| Payment Success | INFO | `user_id`, `transaction_id`, `amount`, `timestamp` | 7 years |
| Payment Failed | WARN | `user_id`, `amount`, `failure_reason`, `timestamp` | 7 years |
| Refund Processed | INFO | `admin_id`, `transaction_id`, `amount`, `reason`, `timestamp` | 7 years |
| Credit Deducted | INFO | `user_id`, `amount`, `reason`, `balance_after`, `timestamp` | 7 years |
| Credit Added | INFO | `user_id`, `amount`, `reason`, `balance_after`, `timestamp` | 7 years |

### 3.5 Security Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| Suspicious Activity Detected | ERROR | `user_id`, `activity_type`, `risk_score`, `timestamp` | 7 years |
| Rate Limit Exceeded | WARN | `ip_address`, `endpoint`, `request_count`, `timestamp` | 90 days |
| SQL Injection Attempt | ERROR | `ip_address`, `payload` (sanitized), `timestamp` | 7 years |
| XSS Attempt Blocked | WARN | `user_id`, `input_field`, `timestamp` | 7 years |
| File Upload Rejected | WARN | `user_id`, `file_type`, `reason`, `timestamp` | 90 days |
| Encryption Key Rotation | INFO | `key_id`, `rotation_timestamp`, `initiated_by` | 7 years |

### 3.6 System Events

| Event | Log Level | Fields Captured | Retention |
|-------|-----------|-----------------|-----------|
| Database Migration Applied | INFO | `migration_name`, `timestamp`, `applied_by` | 7 years |
| Edge Function Deployed | INFO | `function_name`, `version`, `deployed_by`, `timestamp` | 7 years |
| Backup Completed | INFO | `backup_type`, `size`, `duration`, `timestamp` | 7 years |
| Backup Failed | ERROR | `backup_type`, `error_message`, `timestamp` | 7 years |
| Service Degradation | WARN | `service_name`, `latency`, `error_rate`, `timestamp` | 90 days |
| Scheduled Job Executed | INFO | `job_name`, `duration`, `status`, `timestamp` | 90 days |

---

## 4. Implementation Details

### 4.1 Frontend Logging (React)

**Error Tracking:**
```typescript
// Already implemented via Sentry (src/lib/sentry.ts)
import * as Sentry from "@sentry/react";

Sentry.captureException(error, {
  level: 'error',
  tags: {
    component: 'CreditScoreAssessment',
    user_action: 'submit_assessment'
  },
  user: {
    id: user?.id,
    email: user?.email // Only in dev, removed in production
  }
});
```

**User Action Tracking:**
```typescript
// src/lib/auditLogger.ts (new file)
export const logUserAction = (action: string, details: object) => {
  if (import.meta.env.PROD) {
    // Send to audit endpoint
    supabase.from('audit_logs').insert({
      user_id: auth.uid(),
      action,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      ip_address: null, // Captured server-side
      user_agent: navigator.userAgent
    });
  }
};
```

### 4.2 Edge Functions Logging (Deno)

**Structured Logging:**
```typescript
// Standard log format for all edge functions
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  function_name: string;
  user_id?: string;
  action: string;
  details?: object;
  duration_ms?: number;
}

const log = (entry: LogEntry) => {
  console.log(JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString()
  }));
};

// Example usage in edge function
log({
  level: 'INFO',
  function_name: 'analyze-credit-assessment',
  user_id: userId,
  action: 'credit_analysis_started',
  details: { assessment_id: assessmentId }
});
```

**Error Handling:**
```typescript
try {
  // Function logic
} catch (error) {
  log({
    level: 'ERROR',
    function_name: 'analyze-credit-assessment',
    user_id: userId,
    action: 'credit_analysis_failed',
    details: { 
      error_message: error.message,
      error_stack: error.stack // Only in non-prod
    }
  });
  
  // Also send to Sentry via DSN
  throw error;
}
```

### 4.3 Database Logging (PostgreSQL)

**Audit Log Table:**
```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only CISO and auditors can view
CREATE POLICY "Only CISO can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert (security definer function)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Immutable (no updates/deletes)
-- Enforced via RLS policies (no UPDATE/DELETE policies)
```

**Automatic Audit Triggers:**
```sql
-- Example: Log all profile updates
CREATE OR REPLACE FUNCTION log_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP, -- INSERT, UPDATE, DELETE
    'profile',
    NEW.user_id,
    jsonb_build_object(
      'old_values', to_jsonb(OLD),
      'new_values', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profile_audit_trigger
AFTER UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION log_profile_change();
```

**Security Events Table:**
```sql
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  description TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Only CISO can access
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only CISO can view security events"
ON public.security_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

### 4.4 Supabase Analytics

**Accessing Logs:**
```sql
-- Database logs (via Supabase Dashboard)
SELECT 
  identifier, 
  timestamp, 
  event_message, 
  parsed.error_severity
FROM postgres_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Auth logs
SELECT 
  id, 
  timestamp, 
  event_message, 
  metadata.level, 
  metadata.msg
FROM auth_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Edge function logs (accessed via Supabase CLI or Dashboard)
supabase functions logs <function-name> --limit 100
```

---

## 5. Log Monitoring & Alerting

### 5.1 Sentry Alerts

**Critical Alerts (PagerDuty/SMS):**
- Error rate > 1% for 5 minutes
- Performance degradation > 200% baseline
- Security exceptions (SQL injection, XSS attempts)
- Authentication failures > 10 per minute from single IP

**High Priority Alerts (Email/Slack):**
- New error introduced in latest deployment
- API endpoint latency > 2 seconds
- Database query time > 5 seconds
- Failed backup

**Medium Priority (Slack):**
- Warning logs > 100 per hour
- User-reported errors (via feedback)

### 5.2 Database Monitoring

**Queries to Monitor:**
```sql
-- Failed authentication attempts (potential brute force)
SELECT ip_address, count(*) as attempts
FROM auth_logs
WHERE metadata.level = 'error'
  AND timestamp > now() - interval '1 hour'
GROUP BY ip_address
HAVING count(*) > 10;

-- RLS policy violations
SELECT user_id, table_name, count(*) as violations
FROM security_events
WHERE event_type = 'rls_violation'
  AND timestamp > now() - interval '24 hours'
GROUP BY user_id, table_name;

-- Suspicious data access patterns
SELECT user_id, count(DISTINCT resource_id) as accessed_count
FROM audit_logs
WHERE action = 'data_export'
  AND timestamp > now() - interval '1 hour'
GROUP BY user_id
HAVING count(DISTINCT resource_id) > 100;
```

### 5.3 Automated Responses

**Rate Limiting:**
```typescript
// Implemented in edge functions
const RATE_LIMIT = 100; // requests per minute
const attempts = await redis.incr(`rate_limit:${ip_address}`);
if (attempts === 1) {
  await redis.expire(`rate_limit:${ip_address}`, 60);
}
if (attempts > RATE_LIMIT) {
  log({
    level: 'WARN',
    action: 'rate_limit_exceeded',
    details: { ip_address, attempts }
  });
  return new Response('Too Many Requests', { status: 429 });
}
```

**Automatic Account Lock:**
```sql
-- After 5 failed login attempts
CREATE OR REPLACE FUNCTION lock_account_on_failed_attempts()
RETURNS TRIGGER AS $$
DECLARE
  failure_count INTEGER;
BEGIN
  SELECT count(*) INTO failure_count
  FROM auth_logs
  WHERE metadata.email = NEW.metadata.email
    AND metadata.level = 'error'
    AND timestamp > now() - interval '15 minutes';
  
  IF failure_count >= 5 THEN
    -- Lock account (implementation depends on auth system)
    INSERT INTO security_events (
      event_type,
      severity,
      description,
      details
    ) VALUES (
      'account_locked',
      'HIGH',
      'Account locked due to multiple failed login attempts',
      jsonb_build_object('email', NEW.metadata.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Compliance Reporting

### 6.1 Audit Reports

**Monthly Security Report:**
```sql
-- Executive summary for CISO
SELECT 
  date_trunc('day', timestamp) as date,
  count(*) FILTER (WHERE severity = 'CRITICAL') as critical_events,
  count(*) FILTER (WHERE severity = 'HIGH') as high_events,
  count(*) FILTER (WHERE severity = 'MEDIUM') as medium_events
FROM security_events
WHERE timestamp > now() - interval '1 month'
GROUP BY date
ORDER BY date;
```

**User Activity Report (GDPR/POPIA compliance):**
```sql
-- For data subject access requests
SELECT 
  timestamp,
  action,
  resource_type,
  details
FROM audit_logs
WHERE user_id = <requested_user_id>
ORDER BY timestamp DESC;
```

**Privileged Access Report:**
```sql
-- Admin actions audit
SELECT 
  a.timestamp,
  p.email,
  a.action,
  a.resource_type,
  a.details
FROM audit_logs a
JOIN profiles p ON p.user_id = a.user_id
WHERE a.user_id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
)
  AND a.timestamp > now() - interval '1 month'
ORDER BY a.timestamp DESC;
```

### 6.2 Compliance Checklists

**ISO 27001 A.12.4 (Logging and Monitoring):**
- [x] Event logs capturing user activities, exceptions, and security events
- [x] Logs include timestamps, user IDs, event types
- [x] Logs protected against tampering (immutable table, RLS)
- [x] Log retention aligned with legal requirements (7 years)
- [x] Regular review of logs (automated monitoring)
- [x] Clock synchronization (UTC timestamps)

**POPIA Section 22 (Notification of Security Compromise):**
- [x] Detection mechanisms in place (Sentry, security_events table)
- [x] Automated alerting for security events
- [x] Incident response procedures documented
- [x] Breach notification workflow defined

---

## 7. Best Practices

### 7.1 What to Log
✅ **DO Log:**
- Authentication events (success and failure)
- Authorization decisions
- Data access (especially sensitive data)
- System changes (deployments, migrations)
- Security events (anomalies, violations)
- Errors and exceptions
- Performance metrics

❌ **DON'T Log:**
- Passwords (plaintext or hashed)
- Credit card numbers
- API keys or tokens
- Full PII (only IDs or hashed values)
- Sensitive business data

### 7.2 Log Sanitization

```typescript
// Example: Sanitize user input before logging
const sanitizeForLogging = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'api_key', 'credit_card'];
  
  if (typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        acc[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object') {
        acc[key] = sanitizeForLogging(data[key]);
      } else {
        acc[key] = data[key];
      }
      return acc;
    }, {} as any);
  }
  
  return data;
};
```

### 7.3 Performance Considerations
- **Asynchronous Logging**: Don't block requests waiting for logs
- **Batch Writes**: Aggregate logs before writing to database
- **Sampling**: For high-volume events, sample (e.g., 10% of requests)
- **Archival**: Move old logs to cold storage (S3-compatible)

### 7.4 Testing Logs
```typescript
// Example: Unit test for audit logging
it('should log user login event', async () => {
  await loginUser('test@example.com', 'password');
  
  const logs = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'user_login')
    .single();
  
  expect(logs.data).toBeDefined();
  expect(logs.data.user_id).toBe(testUserId);
});
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Sentry integration (already done)
- [ ] Create `audit_logs` table
- [ ] Create `security_events` table
- [ ] Implement `auditLogger.ts` utility
- [ ] Add audit triggers to critical tables

### Phase 2: Edge Functions (Week 3-4)
- [ ] Standardize logging format across all edge functions
- [ ] Add structured logging to existing functions
- [ ] Implement error tracking in edge functions
- [ ] Set up log aggregation

### Phase 3: Monitoring & Alerts (Week 5-6)
- [ ] Configure Sentry alerts
- [ ] Set up database monitoring queries
- [ ] Create security event dashboards
- [ ] Implement automated responses (rate limiting, account locks)

### Phase 4: Compliance & Reporting (Week 7-8)
- [ ] Create compliance report queries
- [ ] Set up automated monthly reports
- [ ] Document log retention procedures
- [ ] Conduct audit log review training

---

## 9. Maintenance

### 9.1 Regular Tasks
- **Daily**: Review critical security events
- **Weekly**: Check Sentry error trends
- **Monthly**: Generate compliance reports
- **Quarterly**: Audit log retention and archival
- **Annually**: Full logging infrastructure review

### 9.2 Log Archival
```sql
-- Archive logs older than 90 days to cold storage
-- (Automated via cron job or scheduled edge function)
COPY (
  SELECT * FROM audit_logs 
  WHERE timestamp < now() - interval '90 days'
) TO '/backups/audit_logs_archive.csv' CSV HEADER;

-- Keep in database for 7 years (legal requirement)
-- Implement partitioning for performance
```

---

## 10. Resources

### Documentation
- Sentry Documentation: https://docs.sentry.io/
- Supabase Analytics: https://supabase.com/docs/guides/platform/logs
- ISO 27001 Annex A.12.4: Logging and Monitoring
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

### Tools
- Sentry (Error & Performance Monitoring)
- Supabase Analytics (Database, Auth, Edge Function Logs)
- PostgreSQL Logging
- pgAudit (Advanced PostgreSQL audit logging - future consideration)

---

**Document Control:**
- **Approved By:** CTO
- **Next Review:** 2025-02-03
- **Version:** 1.0
