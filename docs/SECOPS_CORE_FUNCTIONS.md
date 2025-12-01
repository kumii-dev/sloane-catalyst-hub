# Security Operations Core Functions

**Version**: 1.0  
**Date**: December 1, 2025  
**Owner**: Security Operations Manager  
**Related**: MODERN_SECOPS_ISO27001.md

---

## Table of Contents

1. [Introduction](#introduction)
2. [Unified Enterprise View](#unified-enterprise-view)
3. [Case Management](#case-management)
4. [Security Information and Event Management (SIEM)](#siem)
5. [Threat Intelligence (TI)](#threat-intelligence)
6. [Security Orchestration, Automation and Response (SOAR)](#soar)
7. [Integration Architecture](#integration-architecture)
8. [Data Flow](#data-flow)

---

## 1. Introduction

This document defines the five core functions of Kumii Marketplace's Security Operations Center (SOC), aligned with ISO/IEC 27001:2022 requirements. Each function is enhanced by AI agents to provide 24/7 security monitoring, rapid incident detection, and automated response capabilities.

### 1.1 Core Functions Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Core SOC Functions                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Unified Enterprise View                          │   │
│  │     Correlated visibility across all assets          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. Case Management                                  │   │
│  │     Incident workflow and documentation              │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. SIEM (Security Info & Event Management)          │   │
│  │     Central hunting and investigation platform       │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. Threat Intelligence                              │   │
│  │     Continuous threat data collection & analysis     │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. SOAR (Orchestration, Automation, Response)       │   │
│  │     Automated playbooks and AI agent coordination    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Unified Enterprise View

### 2.1 Purpose

Provide a single-pane-of-glass view of security posture across all enterprise assets, enabling rapid situation awareness and early threat detection.

### 2.2 Scope of Visibility

#### **Assets Monitored:**

1. **Hosting Platforms**
   - Lovable hosting environment
   - CDN configuration and access patterns
   - Static asset delivery infrastructure

2. **Endpoints**
   - Developer workstations
   - Admin devices
   - Mobile devices (PWA users)

3. **Identity and Access Services**
   - Supabase Auth authentication events
   - OAuth provider interactions (Google)
   - Session management and token lifecycle

4. **Modern Applications**
   - React web application (frontend)
   - Edge Functions (backend serverless)
   - API Gateway access patterns

5. **SaaS Applications**
   - Email services (Resend)
   - AI services (OpenAI)
   - Video services (Daily.co)
   - Error monitoring (Sentry)

6. **Data Systems**
   - PostgreSQL database (Supabase)
   - Storage buckets (file uploads)
   - Audit logs and system logs

### 2.3 Unified Dashboard Components

```typescript
// Dashboard data model
interface UnifiedSecurityView {
  timestamp: Date;
  
  // Asset Health
  totalAssets: number;
  healthyAssets: number;
  degradedAssets: number;
  criticalAssets: number;
  
  // Security Posture
  overallRiskScore: number; // 0-100
  activeThreats: number;
  mitigatedThreats: number;
  
  // Activity Summary
  authentications24h: number;
  apiCalls24h: number;
  failedLogins24h: number;
  dataAccess24h: number;
  
  // AI Agent Status
  aiAgentsActive: number;
  aiAgentsIdle: number;
  aiConfidenceAvg: number;
  
  // Incident Status
  openIncidents: number;
  incidentsToday: number;
  avgResponseTime: string; // MTTA
  avgResolutionTime: string; // MTTR
}
```

### 2.4 AI Enhancement

**AI Correlation Engine** analyzes events across all assets to:
- Detect multi-stage attacks spanning different systems
- Identify lateral movement patterns
- Recognize coordinated attack campaigns
- Predict potential attack paths

**Example Correlation:**
```
Failed login (Auth) → API enumeration (Gateway) → Privilege escalation (Database)
   ↓ AI detects pattern
Alert: Potential account takeover attempt with lateral movement
```

### 2.5 Implementation

**Database Schema:**
```sql
-- Unified asset inventory
CREATE TABLE security_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL, -- hosting, endpoint, identity, application, saas, data
  asset_name TEXT NOT NULL,
  asset_identifier TEXT NOT NULL, -- IP, hostname, service name, user ID
  criticality TEXT NOT NULL, -- critical, high, medium, low
  owner TEXT,
  environment TEXT, -- production, staging, development
  last_seen TIMESTAMPTZ DEFAULT now(),
  health_status TEXT DEFAULT 'healthy', -- healthy, degraded, critical, offline
  risk_score INTEGER DEFAULT 0, -- 0-100
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unified security events
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  asset_id UUID REFERENCES security_assets(id),
  event_type TEXT NOT NULL, -- authentication, api_access, data_access, config_change
  severity TEXT NOT NULL, -- critical, high, medium, low, informational
  source_ip INET,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  outcome TEXT, -- success, failure, blocked
  details JSONB,
  correlation_id UUID, -- Link related events
  ai_analyzed BOOLEAN DEFAULT false,
  ai_risk_score FLOAT, -- 0-1
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_security_events_timestamp ON security_events(event_timestamp DESC);
CREATE INDEX idx_security_events_asset ON security_events(asset_id, event_timestamp DESC);
CREATE INDEX idx_security_events_user ON security_events(user_id, event_timestamp DESC);
CREATE INDEX idx_security_events_correlation ON security_events(correlation_id);
```

---

## 3. Case Management

### 3.1 Purpose

Provide standardized workflow for security incident lifecycle management, ensuring consistent handling, documentation, and compliance with ISO requirements.

### 3.2 Incident Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│              Incident Lifecycle                           │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  1. Detection → 2. Triage → 3. Investigation →            │
│     ↓             ↓            ↓                           │
│  4. Containment → 5. Remediation → 6. Post-Incident Review│
│     ↓             ↓               ↓                        │
│  7. Documentation & Closure                                │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Case Management Workflow

#### **Phase 1: Detection**
- **Trigger**: Alert from SIEM, AI agent, or manual report
- **Action**: Create incident case automatically or manually
- **Owner**: Detection Agent or SOC Analyst
- **SLA**: Immediate (< 1 minute for automated)

#### **Phase 2: Triage** 
- **Action**: Assess severity, priority, and impact
- **Owner**: Triage Agent + SOC Analyst (review)
- **Output**: Priority classification (P0-P4)
- **SLA**: 5 minutes (P0/P1), 15 minutes (P2), 1 hour (P3/P4)

**Priority Matrix:**
```
| Impact ↓ \ Likelihood → | High | Medium | Low |
|-------------------------|------|--------|-----|
| Critical Business       | P0   | P1     | P2  |
| Significant Impact      | P1   | P2     | P3  |
| Minor Impact            | P2   | P3     | P4  |
```

#### **Phase 3: Investigation**
- **Action**: Root cause analysis, evidence collection, timeline reconstruction
- **Owner**: Investigation Agent + Security Analyst
- **Tools**: SIEM queries, log analysis, forensic tools
- **Output**: Investigation report with findings

#### **Phase 4: Containment**
- **Action**: Isolate affected systems, block malicious activity
- **Owner**: Response Agent + Incident Responder
- **Methods**: 
  - Account lockout
  - IP/domain blocking
  - Service isolation
  - Access revocation
- **SLA**: 15 minutes (P0), 30 minutes (P1), 2 hours (P2)

#### **Phase 5: Remediation**
- **Action**: Remove threat, patch vulnerabilities, restore services
- **Owner**: Response Agent + System Administrator
- **Validation**: Confirm threat eliminated, systems secure

#### **Phase 6: Post-Incident Review**
- **Action**: Lessons learned, process improvements
- **Owner**: Security Operations Manager
- **Output**: PIR (Post-Incident Review) document
- **Timeline**: Within 5 business days of closure

#### **Phase 7: Documentation & Closure**
- **Action**: Final documentation, evidence archival, case closure
- **Owner**: SOC Analyst
- **Requirements**: All fields complete, evidence preserved, lessons learned documented

### 3.4 Case Data Model

```typescript
interface SecurityIncident {
  // Identification
  id: string; // INC-YYYY-NNNN
  title: string;
  description: string;
  
  // Classification
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string; // phishing, malware, data_breach, dos, privilege_escalation
  
  // Status Tracking
  status: 'new' | 'triaged' | 'investigating' | 'contained' | 'remediated' | 'closed';
  stage: 'detection' | 'triage' | 'investigation' | 'containment' | 'remediation' | 'review' | 'closed';
  
  // Assignment
  assignedTo: string; // User ID or AI agent
  assignedAt: Date;
  team: string; // SOC, Incident Response, IT Operations
  
  // Timeline
  detectedAt: Date;
  triagedAt?: Date;
  acknowledgedAt?: Date; // For MTTA
  containedAt?: Date;
  remediatedAt?: Date; // For MTTR
  closedAt?: Date;
  
  // Impact
  affectedAssets: string[]; // Asset IDs
  affectedUsers: string[]; // User IDs
  businessImpact: string;
  estimatedCost?: number;
  
  // AI Analysis
  aiConfidence: number; // 0-1
  aiRiskScore: number; // 0-100
  aiRecommendations: string[];
  humanOverride: boolean;
  
  // Evidence
  evidenceUrls: string[];
  relatedEvents: string[]; // Event IDs
  relatedIncidents: string[]; // Other incident IDs
  
  // Compliance
  regulatoryReporting: boolean;
  dataBreachNotification: boolean;
  
  // Resolution
  rootCause: string;
  actionsTaken: string[];
  lessonsLearned: string;
  preventativeMeasures: string[];
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}
```

### 3.5 Database Schema

```sql
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL, -- INC-2025-0001
  title TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2', 'P3', 'P4')),
  category TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new',
  stage TEXT NOT NULL DEFAULT 'detection',
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  team TEXT,
  
  -- Timeline (for SLA tracking)
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triaged_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  contained_at TIMESTAMPTZ,
  remediated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Impact
  affected_assets JSONB DEFAULT '[]'::jsonb,
  affected_users JSONB DEFAULT '[]'::jsonb,
  business_impact TEXT,
  estimated_cost DECIMAL(10,2),
  
  -- AI Analysis
  ai_confidence FLOAT CHECK (ai_confidence BETWEEN 0 AND 1),
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
  ai_recommendations JSONB,
  human_override BOOLEAN DEFAULT false,
  
  -- Evidence
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  related_events JSONB DEFAULT '[]'::jsonb,
  related_incidents JSONB DEFAULT '[]'::jsonb,
  
  -- Compliance
  regulatory_reporting BOOLEAN DEFAULT false,
  data_breach_notification BOOLEAN DEFAULT false,
  
  -- Resolution
  root_cause TEXT,
  actions_taken JSONB,
  lessons_learned TEXT,
  preventative_measures JSONB,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Incident comments/notes
CREATE TABLE incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note', -- note, action, evidence, decision
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SLA tracking
CREATE INDEX idx_incidents_sla ON security_incidents(priority, detected_at, acknowledged_at, remediated_at)
WHERE closed_at IS NULL;
```

### 3.6 AI Enhancement

**Triage Agent** automatically:
- Classifies severity based on asset criticality and threat indicators
- Assigns priority using business impact analysis
- Suggests initial response actions
- Identifies related incidents for pattern detection

**Investigation Agent** provides:
- Automated evidence collection from multiple sources
- Timeline reconstruction from correlated events
- Root cause hypothesis generation
- Similar incident pattern matching

---

## 4. Security Information and Event Management (SIEM)

### 4.1 Purpose

Serve as the central hunting and investigation platform, aggregating security data from all sources and providing correlation, analysis, and search capabilities.

### 4.2 SIEM Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIEM Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Data Ingestion Layer                    │   │
│  │  - Authentication logs  - API Gateway logs            │   │
│  │  - Database audit logs  - Application logs            │   │
│  │  - Edge Function logs   - Storage access logs         │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Normalization & Parsing                  │   │
│  │  - Log parsing     - Field extraction                 │   │
│  │  - Timestamp norm  - Data enrichment                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Correlation Engine                       │   │
│  │  - Rule-based correlation                             │   │
│  │  - AI-powered anomaly detection                       │   │
│  │  - Behavioral analytics (UEBA)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Security Data Lake (Storage)                │   │
│  │  - Hot storage (30 days)   - Warm storage (1 year)   │   │
│  │  - Cold storage (7 years for compliance)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Analysis & Visualization Layer               │   │
│  │  - Search queries   - Dashboards    - Reports         │   │
│  │  - AI investigation - Threat hunting                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Data Sources

#### **4.3.1 Authentication Events**
```sql
-- Source: Supabase Auth, OAuth providers
{
  "timestamp": "2025-12-01T14:23:15Z",
  "event_type": "authentication",
  "sub_type": "login_attempt",
  "user_email": "user@example.com",
  "user_id": "uuid",
  "provider": "email" | "google",
  "source_ip": "192.0.2.100",
  "user_agent": "Mozilla/5.0...",
  "outcome": "success" | "failure",
  "failure_reason": "invalid_password",
  "session_id": "uuid",
  "mfa_used": true/false
}
```

#### **4.3.2 API Access Logs**
```sql
-- Source: Supabase Edge Functions, API Gateway
{
  "timestamp": "2025-12-01T14:25:30Z",
  "event_type": "api_access",
  "endpoint": "/functions/v1/copilot-chat",
  "method": "POST",
  "user_id": "uuid",
  "source_ip": "192.0.2.100",
  "status_code": 200,
  "response_time_ms": 245,
  "request_size_bytes": 1024,
  "response_size_bytes": 2048,
  "headers": {...},
  "rate_limit_hit": false
}
```

#### **4.3.3 Database Audit Logs**
```sql
-- Source: PostgreSQL audit extension
{
  "timestamp": "2025-12-01T14:27:45Z",
  "event_type": "database_access",
  "operation": "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  "table": "user_roles",
  "user_id": "uuid",
  "affected_rows": 1,
  "query": "SELECT * FROM user_roles WHERE user_id = $1",
  "source_ip": "internal",
  "connection_id": "conn_123"
}
```

#### **4.3.4 AI Operations Logs**
```sql
-- Source: ai_operations_log table
{
  "timestamp": "2025-12-01T14:30:00Z",
  "event_type": "ai_operation",
  "agent_type": "detection",
  "action": "classify_incident",
  "confidence": 0.89,
  "input_summary": "Failed login attempt pattern",
  "output_summary": "Potential brute force attack",
  "incident_id": "INC-2025-001"
}
```

### 4.4 Correlation Rules

#### **Rule Example 1: Brute Force Detection**
```sql
-- Detect 5+ failed logins from same IP within 5 minutes
SELECT 
  source_ip,
  COUNT(*) as failed_attempts,
  array_agg(user_email) as targeted_users
FROM security_events
WHERE event_type = 'authentication'
  AND outcome = 'failure'
  AND event_timestamp > now() - interval '5 minutes'
GROUP BY source_ip
HAVING COUNT(*) >= 5;
```

#### **Rule Example 2: Privilege Escalation**
```sql
-- Detect user role changes within 1 hour of failed access attempts
WITH failed_access AS (
  SELECT user_id, event_timestamp
  FROM security_events
  WHERE event_type = 'api_access'
    AND outcome = 'blocked'
    AND event_timestamp > now() - interval '1 hour'
),
role_changes AS (
  SELECT user_id, created_at as change_time
  FROM user_roles
  WHERE created_at > now() - interval '1 hour'
)
SELECT 
  f.user_id,
  f.event_timestamp as failed_access_time,
  r.change_time as role_change_time,
  (r.change_time - f.event_timestamp) as time_diff
FROM failed_access f
JOIN role_changes r ON f.user_id = r.user_id
WHERE r.change_time > f.event_timestamp;
```

### 4.5 User and Entity Behavior Analytics (UEBA)

**AI-Powered Behavioral Baselines:**

```typescript
interface UserBehavior {
  userId: string;
  
  // Authentication patterns
  usualLoginTimes: number[]; // Hours of day (0-23)
  usualLocations: string[]; // IP ranges or geo-locations
  usualDevices: string[]; // User-agent fingerprints
  
  // Activity patterns
  avgApiCallsPerDay: number;
  avgDataAccessPerDay: number;
  usualAccessPatterns: string[]; // Sequence of actions
  
  // Risk indicators
  baselineRiskScore: number; // Normal behavior = 0-20
  currentRiskScore: number; // Current session risk
  anomalyScore: number; // Deviation from baseline
  
  // Last updated
  lastCalculated: Date;
  dataPoints: number; // Sample size
}
```

**Anomaly Detection:**
- Login from new location: +20 risk score
- Login at unusual time: +15 risk score
- Unusual API call volume: +25 risk score
- Access to sensitive data: +30 risk score
- Combination triggers alert when risk > 70

### 4.6 Search and Investigation Capabilities

**Natural Language Search (AI-Powered):**

User Query: "Show me all failed logins from external IPs in the last 24 hours"

AI Translation:
```sql
SELECT *
FROM security_events
WHERE event_type = 'authentication'
  AND outcome = 'failure'
  AND source_ip NOT LIKE '10.%' -- Internal network
  AND event_timestamp > now() - interval '24 hours'
ORDER BY event_timestamp DESC;
```

**Investigation Playbook:**
1. Identify suspicious event
2. Find related events (same user, IP, or correlation_id)
3. Build timeline
4. Analyze patterns
5. Determine threat level
6. Generate investigation report

---

## 5. Threat Intelligence (TI)

### 5.1 Purpose

Continuously collect, validate, and integrate threat intelligence to enrich investigations and proactive threat detection.

### 5.2 Threat Intelligence Sources

#### **5.2.1 Open Source Intelligence (OSINT)**
- CVE databases (NVD, MITRE)
- Security advisories (vendors, CERTs)
- Threat actor profiles (MITRE ATT&CK)
- IoC feeds (open-source communities)

#### **5.2.2 Commercial Threat Intelligence**
- Threat intelligence platforms (TIP)
- Vendor-specific threat feeds
- Industry-specific intelligence (FinTech, SaaS)

#### **5.2.3 Internal Threat Intelligence**
- Historical incident data
- Attack patterns observed
- Lessons learned database
- Custom IoCs from investigations

### 5.3 Threat Intelligence Data Model

```typescript
interface ThreatIntelligence {
  // Identification
  id: string;
  type: 'CVE' | 'IoC' | 'Advisory' | 'Actor' | 'TTP';
  identifier: string; // CVE-2025-12345, IP:192.0.2.100
  
  // Classification
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  relevance: 'high' | 'medium' | 'low'; // To Kumii environment
  
  // Content
  title: string;
  description: string;
  indicators: string[]; // IPs, domains, hashes, patterns
  
  // Context
  threatActors: string[];
  attackVectors: string[];
  affectedSystems: string[];
  mitigations: string[];
  
  // Lifecycle
  published: Date;
  expires?: Date;
  lastVerified: Date;
  status: 'active' | 'expired' | 'deprecated';
  
  // Integration
  siem_integrated: boolean;
  detection_rules_created: boolean;
  applied_to_incidents: string[]; // Incident IDs
  
  // Source
  source: string;
  sourceUrl: string;
  confidence_level: string;
}
```

### 5.4 TI Integration with Detection

**Automated IoC Matching:**
```sql
-- Check incoming events against threat intelligence
WITH current_threats AS (
  SELECT indicator, severity
  FROM threat_intelligence
  WHERE type = 'IoC'
    AND status = 'active'
    AND relevance IN ('high', 'medium')
)
SELECT 
  e.*,
  t.severity as threat_severity,
  'TI_MATCH' as alert_type
FROM security_events e
JOIN current_threats t ON (
  e.source_ip::text = t.indicator
  OR e.details->>'domain' = t.indicator
  OR e.details->>'file_hash' = t.indicator
)
WHERE e.event_timestamp > now() - interval '1 hour';
```

### 5.5 AI-Enhanced Threat Intelligence

**AI Capabilities:**
- **Relevance Scoring**: Automatically assess how relevant each TI item is to Kumii
- **Trend Analysis**: Identify emerging threat patterns
- **Predictive Intelligence**: Forecast likely attack vectors
- **Contextualization**: Enrich TI with business context

---

## 6. Security Orchestration, Automation and Response (SOAR)

### 6.1 Purpose

Automate repetitive security tasks, orchestrate response workflows, and integrate AI agents for consistent and rapid incident response.

### 6.2 SOAR Components

```
┌──────────────────────────────────────────────────────────┐
│                  SOAR Architecture                        │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Playbook Library                          │ │
│  │  - Phishing Response     - Data Breach Response     │ │
│  │  - Malware Containment   - DDoS Mitigation          │ │
│  │  - Account Compromise    - Privilege Escalation     │ │
│  └─────────────────────────────────────────────────────┘ │
│                         ↓                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Orchestration Engine (AI-Driven)            │ │
│  │  - Playbook selection    - Task routing             │ │
│  │  - Parallel execution    - Error handling           │ │
│  └─────────────────────────────────────────────────────┘ │
│                         ↓                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Integration Layer                       │ │
│  │  - Supabase API    - Email (Resend)                 │ │
│  │  - Slack/Teams     - Ticketing                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                         ↓                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                AI Agent Pool                         │ │
│  │  Detection → Triage → Investigation → Response      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 6.3 Automated Response Actions

#### **6.3.1 Account-Related Actions**
- **Lock Account**: Disable user authentication
- **Force Logout**: Invalidate all active sessions
- **Reset Password**: Trigger password reset flow
- **Revoke API Keys**: Disable compromised API keys
- **MFA Reset**: Force MFA re-enrollment

#### **6.3.2 Network-Related Actions**
- **IP Blocking**: Add IP to block list (WAF/firewall)
- **Rate Limiting**: Apply aggressive rate limits
- **Geofencing**: Block access from specific regions

#### **6.3.3 Data-Related Actions**
- **Freeze Account**: Prevent data modifications
- **Audit Data Access**: Log all data access attempts
- **Backup**: Create point-in-time backup
- **Encryption**: Re-encrypt sensitive data with new keys

#### **6.3.4 Notification Actions**
- **Alert SOC**: Send to SOC dashboard
- **Email Notification**: Alert security team
- **Slack Alert**: Real-time team notification
- **Executive Briefing**: Summary for CISO/management

### 6.4 Example Playbook: Brute Force Response

```yaml
playbook_name: "Brute Force Attack Response"
playbook_id: "PB-BF-001"
version: "1.0"
trigger:
  alert_type: "brute_force_detected"
  conditions:
    - failed_attempts >= 5
    - time_window <= "5 minutes"

steps:
  - step: 1
    name: "Immediate Containment"
    actions:
      - type: "block_ip"
        parameters:
          ip: "{{ alert.source_ip }}"
          duration: "1 hour"
      - type: "notify_soc"
        parameters:
          severity: "high"
          message: "Brute force attack from {{ alert.source_ip }}"
    
  - step: 2
    name: "Investigation"
    actions:
      - type: "ai_investigate"
        agent: "investigation_agent"
        parameters:
          query: "Analyze all activity from {{ alert.source_ip }} in last 24h"
      - type: "check_successful_logins"
        parameters:
          ip: "{{ alert.source_ip }}"
          time_range: "24 hours"
    
  - step: 3
    name: "User Notification"
    condition: "successful_login_found == true"
    actions:
      - type: "force_logout"
        parameters:
          user_id: "{{ affected_user_id }}"
      - type: "send_email"
        parameters:
          to: "{{ affected_user_email }}"
          template: "suspicious_login_detected"
      - type: "require_password_reset"
        parameters:
          user_id: "{{ affected_user_id }}"
    
  - step: 4
    name: "Documentation"
    actions:
      - type: "create_incident"
        parameters:
          title: "Brute Force Attack - {{ alert.source_ip }}"
          severity: "high"
          category: "authentication_attack"
      - type: "ai_generate_report"
        agent: "reporting_agent"
        parameters:
          incident_id: "{{ incident.id }}"

escalation:
  - condition: "successful_login_found == true AND user_role == 'admin'"
    action: "notify_ciso"
  - condition: "attack_duration > 30 minutes"
    action: "escalate_to_incident_response_team"
```

### 6.5 AI Agent Orchestration

**Multi-Agent Workflow:**

```typescript
interface PlaybookExecution {
  playbookId: string;
  executionId: string;
  triggeredBy: 'alert' | 'manual' | 'scheduled';
  
  // Agent assignments
  agents: {
    detection?: string; // Agent ID
    triage?: string;
    investigation?: string;
    response?: string;
    reporting?: string;
  };
  
  // Execution state
  currentStep: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  
  // Results
  actions_taken: Action[];
  decisions_made: Decision[];
  human_interventions: number;
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration_seconds?: number;
}
```

**Parallel vs Sequential Execution:**
- **Parallel**: Multiple containment actions (block IP + lock account)
- **Sequential**: Investigation → Analysis → Recommendation → Execution
- **Human-in-Loop**: Critical decisions require analyst approval

### 6.6 Metrics and Optimization

**SOAR Effectiveness Metrics:**
- Playbook success rate
- Average execution time
- Human intervention frequency
- False positive rate
- Cost savings (time saved)

**AI Optimization:**
- Learn from successful/failed executions
- Adapt playbooks based on outcomes
- Suggest new automation opportunities
- Identify repetitive manual tasks

---

## 7. Integration Architecture

### 7.1 System Integration Map

```
┌─────────────────────────────────────────────────────────┐
│               External Systems                           │
│  - Email (Resend)      - AI (OpenAI)                    │
│  - Video (Daily.co)    - Monitoring (Sentry)            │
└─────────────────────────────────────────────────────────┘
                         ↓ APIs
┌─────────────────────────────────────────────────────────┐
│                  SOAR Platform                           │
│  - Playbook Engine    - AI Orchestrator                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    SIEM Platform                         │
│  - Log Aggregation    - Correlation Engine              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Kumii Application Layer                     │
│  - React Frontend     - Edge Functions                  │
│  - Supabase Auth      - PostgreSQL Database             │
└─────────────────────────────────────────────────────────┘
```

### 7.2 API Endpoints

**Security Operations API:**
```typescript
// Incident Management
POST   /api/security/incidents              // Create incident
GET    /api/security/incidents/:id          // Get incident details
PUT    /api/security/incidents/:id          // Update incident
GET    /api/security/incidents              // List incidents

// Event Ingestion
POST   /api/security/events                 // Log security event
GET    /api/security/events                 // Query events

// Threat Intelligence
GET    /api/security/threat-intel           // Get active threats
POST   /api/security/threat-intel           // Add TI item

// AI Agent Operations
POST   /api/security/ai/analyze             // Request AI analysis
GET    /api/security/ai/status              // Get AI agent status

// Playbook Execution
POST   /api/security/playbooks/:id/execute  // Run playbook
GET    /api/security/playbooks/:id/status   // Check execution status
```

---

## 8. Data Flow

### 8.1 End-to-End Data Flow

```
┌───────────────────────────────────────────────────────┐
│  1. Event Generation                                  │
│     User action → System generates log/event          │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  2. Log Collection                                    │
│     Collectors gather logs from all sources           │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  3. Normalization                                     │
│     Parse, standardize, enrich with context           │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  4. SIEM Ingestion                                    │
│     Store in security_events table                    │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  5. Correlation & Detection                           │
│     Apply rules, AI models, TI matching               │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  6. Alert Generation (if suspicious)                  │
│     Create security alert                             │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  7. AI Triage                                         │
│     Triage Agent classifies and prioritizes           │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  8. Incident Creation                                 │
│     Create incident case in case management           │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  9. SOAR Playbook Execution                           │
│     Automated response actions                        │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  10. Human Analysis (if needed)                       │
│      SOC analyst reviews and makes decisions          │
└───────────────────────────────────────────────────────┘
                       ↓
┌───────────────────────────────────────────────────────┐
│  11. Resolution & Documentation                       │
│      Close incident, document lessons learned         │
└───────────────────────────────────────────────────────┘
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ Deploy database schemas (security_assets, security_events, security_incidents)
- ✅ Implement logging for authentication events
- ✅ Create basic SOC dashboard

### Phase 2: SIEM Integration (Weeks 3-4)
- Deploy log collectors for all data sources
- Implement correlation rules
- Build search and investigation UI

### Phase 3: AI Integration (Weeks 5-6)
- Deploy AI agents (detection, triage, investigation)
- Implement UEBA behavioral baselines
- Configure AI-powered anomaly detection

### Phase 4: SOAR Automation (Weeks 7-8)
- Build playbook library
- Implement automated response actions
- Configure notification channels

### Phase 5: Optimization (Weeks 9-10)
- Fine-tune detection rules
- Reduce false positives
- Optimize AI models

---

## 10. Compliance and Audit

### 10.1 ISO/IEC 27001:2022 Evidence

| Function | ISO Control | Evidence |
|----------|-------------|----------|
| Unified View | A.8.16 | Security dashboard screenshots, asset inventory |
| Case Management | A.5.24, A.5.36 | Incident records, case management logs |
| SIEM | A.5.36, A.5.37, A.5.40 | Log retention policies, search audit trails |
| Threat Intelligence | A.5.7 | TI feed subscriptions, integration logs |
| SOAR | A.5.36, A.5.41 | Playbook execution logs, response times |

### 10.2 Audit Trail

All security operations activities are logged:
- Incident creation, updates, closure
- Playbook executions
- AI agent decisions
- Human analyst actions
- Configuration changes

**Retention**: 7 years (compliance requirement)

---

## Appendix A: Glossary

- **MTTA**: Mean Time to Acknowledge
- **MTTR**: Mean Time to Remediate
- **SIEM**: Security Information and Event Management
- **SOAR**: Security Orchestration, Automation and Response
- **TI**: Threat Intelligence
- **IoC**: Indicator of Compromise
- **UEBA**: User and Entity Behavior Analytics
- **PIR**: Post-Incident Review

---

**End of Document**

**Next Steps**: Proceed to Task 3 - XDR Architecture Design
