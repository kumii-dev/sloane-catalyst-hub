# Extended Detection and Response (XDR) Architecture

**Version**: 1.0  
**Date**: December 1, 2025  
**Owner**: Security Operations Manager  
**Related**: MODERN_SECOPS_ISO27001.md, SECOPS_CORE_FUNCTIONS.md

---

## Table of Contents

1. [Introduction](#introduction)
2. [XDR Overview](#xdr-overview)
3. [Detection Domains](#detection-domains)
4. [Cross-Domain Correlation](#cross-domain-correlation)
5. [AI-Powered Analysis](#ai-powered-analysis)
6. [Response Orchestration](#response-orchestration)
7. [Data Collection Architecture](#data-collection-architecture)
8. [Integration Points](#integration-points)
9. [Implementation Strategy](#implementation-strategy)

---

## 1. Introduction

### 1.1 Purpose

This document defines the Extended Detection and Response (XDR) architecture for Kumii Marketplace's security operations. XDR extends traditional endpoint detection by correlating security data across multiple domains to provide unified threat detection, investigation, and response capabilities.

### 1.2 Scope

The XDR implementation covers six primary detection domains:
1. **Endpoint Security** - Workstations, mobile devices, admin machines
2. **Cloud Infrastructure** - Hosting platforms, CDN, cloud services
3. **Identity & Access** - Authentication systems, OAuth, session management
4. **Application Layer** - Web applications, APIs, Edge Functions
5. **SaaS Security** - Third-party services (email, AI, video, monitoring)
6. **Data Security** - Database access, storage, file operations

### 1.3 ISO/IEC 27001:2022 Alignment

**Relevant Annex A Controls**:
- **A.5.7** - Threat intelligence
- **A.8.15** - Logging
- **A.8.16** - Monitoring activities
- **A.5.36** - Capacity planning (for detection systems)
- **A.5.37** - Redundancy of information processing facilities

---

## 2. XDR Overview

### 2.1 Traditional vs. XDR Approach

```
┌─────────────────────────────────────────────────────────────┐
│           Traditional Siloed Security                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Endpoint │  │  Cloud   │  │ Identity │  │   App    │   │
│  │  Tools   │  │  Tools   │  │  Tools   │  │  Tools   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       ↓              ↓              ↓              ↓         │
│  Separate     Separate       Separate       Separate        │
│  Consoles     Alerts         Analysis       Response        │
│                                                               │
│  ❌ No correlation across domains                            │
│  ❌ Manual investigation required                            │
│  ❌ Slow response times                                      │
│  ❌ Alert fatigue                                            │
└─────────────────────────────────────────────────────────────┘

                            ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│              XDR Unified Security Platform                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         XDR Correlation & Analysis Engine            │   │
│  │         (AI-Powered Cross-Domain Detection)          │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↑           ↑           ↑           ↑              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Endpoint │  │  Cloud   │  │ Identity │  │   App    │   │
│  │   Data   │  │   Data   │  │   Data   │  │   Data   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ✅ Unified correlation across all domains                   │
│  ✅ Automated investigation with AI                          │
│  ✅ Rapid automated response                                 │
│  ✅ Context-aware alerts (reduced false positives)           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 XDR Benefits

**For Kumii Marketplace**:
1. **Faster Threat Detection**: Detect multi-stage attacks spanning different systems
2. **Reduced Alert Fatigue**: AI correlation reduces false positives by 60-80%
3. **Automated Response**: Contain threats in minutes, not hours
4. **Complete Visibility**: Single pane of glass across entire infrastructure
5. **Cost Efficiency**: Consolidate multiple security tools

**Key Metrics**:
- MTTA (Mean Time to Acknowledge): < 3 minutes (target)
- MTTR (Mean Time to Remediate): < 15 minutes (target)
- Detection Accuracy: > 95% (with AI correlation)
- False Positive Rate: < 5% (from 30-40% with traditional tools)

---

## 3. Detection Domains

### 3.1 Domain 1: Endpoint Security

#### **Scope**
- Developer workstations (macOS, Windows, Linux)
- Admin devices
- Mobile devices (PWA users on iOS/Android)
- IoT devices (if applicable)

#### **Data Sources**
```typescript
interface EndpointTelemetry {
  // Device Identity
  device_id: string;
  device_name: string;
  device_type: 'workstation' | 'mobile' | 'iot';
  os_type: string;
  os_version: string;
  
  // Process Activity
  processes: {
    process_id: number;
    process_name: string;
    process_path: string;
    command_line: string;
    parent_process: string;
    user: string;
    start_time: Date;
    network_connections?: NetworkConnection[];
  }[];
  
  // File System Activity
  file_operations: {
    operation: 'create' | 'modify' | 'delete' | 'access';
    file_path: string;
    file_hash: string;
    timestamp: Date;
    user: string;
  }[];
  
  // Network Activity
  network_connections: {
    protocol: string;
    source_ip: string;
    source_port: number;
    dest_ip: string;
    dest_port: number;
    bytes_sent: number;
    bytes_received: number;
    duration: number;
  }[];
  
  // Authentication Events
  login_events: {
    timestamp: Date;
    user: string;
    login_type: 'local' | 'remote' | 'network';
    outcome: 'success' | 'failure';
    failure_reason?: string;
  }[];
  
  // Security Posture
  security_status: {
    antivirus_enabled: boolean;
    antivirus_updated: boolean;
    firewall_enabled: boolean;
    disk_encryption: boolean;
    os_patches_current: boolean;
    last_scan: Date;
  };
  
  timestamp: Date;
}
```

#### **Threat Detection Scenarios**
1. **Malware Execution**: Detect suspicious process creation patterns
2. **Credential Dumping**: Monitor for LSASS access, credential file reads
3. **Lateral Movement**: Detect RDP, SSH, or SMB connections to unusual hosts
4. **Data Exfiltration**: Monitor for large file transfers to external IPs
5. **Privilege Escalation**: Detect sudo/admin privilege usage patterns

#### **Detection Rules**
```sql
-- Example: Detect suspicious process creation
CREATE OR REPLACE FUNCTION detect_suspicious_process()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for known malicious process names
  IF NEW.process_name ~* '(powershell|cmd|bash).exe' 
     AND NEW.command_line ~* '(downloadstring|iex|invoke-expression)' THEN
    INSERT INTO security_alerts (
      alert_type, severity, title, details
    ) VALUES (
      'endpoint_threat',
      'high',
      'Suspicious PowerShell Command Detected',
      jsonb_build_object(
        'device_id', NEW.device_id,
        'process_name', NEW.process_name,
        'command_line', NEW.command_line,
        'user', NEW.user
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 3.2 Domain 2: Cloud Infrastructure

#### **Scope**
- Lovable hosting platform
- CDN (Content Delivery Network)
- Cloud storage (Supabase Storage)
- Serverless functions (Edge Functions)
- Database infrastructure (PostgreSQL)

#### **Data Sources**
```typescript
interface CloudInfrastructureTelemetry {
  // Resource Activity
  resource_id: string;
  resource_type: 'compute' | 'storage' | 'database' | 'network' | 'function';
  resource_name: string;
  
  // Configuration Changes
  config_changes: {
    timestamp: Date;
    change_type: 'create' | 'update' | 'delete';
    field_changed: string;
    old_value: any;
    new_value: any;
    changed_by: string;
    change_source: 'console' | 'api' | 'terraform' | 'cli';
  }[];
  
  // Access Logs
  access_events: {
    timestamp: Date;
    principal: string; // User or service account
    action: string;
    resource: string;
    outcome: 'success' | 'denied';
    source_ip: string;
    user_agent: string;
  }[];
  
  // Performance Metrics
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_io: number;
    network_io: number;
    request_count: number;
    error_rate: number;
  };
  
  // Security Findings
  vulnerabilities: {
    cve_id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affected_component: string;
    discovered_date: Date;
    remediation_status: 'open' | 'in_progress' | 'resolved';
  }[];
  
  timestamp: Date;
}
```

#### **Threat Detection Scenarios**
1. **Resource Hijacking**: Detect unusual compute usage (crypto-mining)
2. **Data Breach**: Monitor for bulk data downloads or exports
3. **Configuration Tampering**: Detect security setting changes
4. **Account Takeover**: Unusual API activity from admin accounts
5. **DDoS Attack**: Sudden spike in requests or bandwidth

#### **Detection Rules**
```typescript
// AI-powered anomaly detection for cloud resources
const detectCloudAnomaly = async (metrics: CloudInfrastructureTelemetry) => {
  // Calculate baseline (30-day average)
  const baseline = await calculateResourceBaseline(
    metrics.resource_id,
    30 // days
  );
  
  // Check for significant deviations
  const cpuDeviation = (metrics.metrics.cpu_usage - baseline.avg_cpu) / baseline.std_cpu;
  const memoryDeviation = (metrics.metrics.memory_usage - baseline.avg_memory) / baseline.std_memory;
  
  // Alert if 3+ standard deviations from normal
  if (Math.abs(cpuDeviation) > 3 || Math.abs(memoryDeviation) > 3) {
    await createAlert({
      alert_type: 'cloud_anomaly',
      severity: 'high',
      title: 'Unusual Cloud Resource Activity',
      details: {
        resource_id: metrics.resource_id,
        cpu_deviation: cpuDeviation,
        memory_deviation: memoryDeviation,
        current_usage: metrics.metrics
      },
      ai_confidence: calculateConfidence(cpuDeviation, memoryDeviation)
    });
  }
};
```

---

### 3.3 Domain 3: Identity & Access Management

#### **Scope**
- Supabase Auth authentication events
- OAuth providers (Google)
- Session management
- API key usage
- Service account activity

#### **Data Sources**
```typescript
interface IdentityAccessTelemetry {
  // Authentication Events
  auth_events: {
    event_id: string;
    timestamp: Date;
    event_type: 'login' | 'logout' | 'mfa_challenge' | 'password_reset' | 'token_refresh';
    user_id?: string;
    user_email?: string;
    provider: 'email' | 'google' | 'api_key' | 'service_account';
    
    // Context
    source_ip: string;
    geo_location: {
      country: string;
      city: string;
      lat: number;
      lon: number;
    };
    user_agent: string;
    device_fingerprint: string;
    
    // Outcome
    outcome: 'success' | 'failure' | 'mfa_required' | 'blocked';
    failure_reason?: string;
    
    // Risk Indicators
    is_new_device: boolean;
    is_new_location: boolean;
    is_tor_exit_node: boolean;
    is_vpn: boolean;
    risk_score: number; // 0-100
  }[];
  
  // Session Activity
  sessions: {
    session_id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
    last_activity: Date;
    ip_addresses: string[];
    user_agents: string[];
    is_active: boolean;
  }[];
  
  // Permission Changes
  permission_changes: {
    timestamp: Date;
    user_id: string;
    changed_by: string;
    change_type: 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked';
    role_or_permission: string;
  }[];
  
  // API Key Activity
  api_key_usage: {
    api_key_id: string;
    timestamp: Date;
    endpoint: string;
    method: string;
    response_code: number;
    rate_limit_hit: boolean;
  }[];
}
```

#### **Threat Detection Scenarios**
1. **Credential Stuffing**: Multiple failed logins with different credentials
2. **Account Takeover**: Login from unusual location/device after credential leak
3. **Token Theft**: Session token used from multiple IPs simultaneously
4. **Privilege Escalation**: Rapid role elevation after initial access
5. **API Abuse**: Unusual API key usage patterns

#### **Advanced Detection: Impossible Travel**
```typescript
// Detect impossible travel - login from two distant locations in short time
const detectImpossibleTravel = async (currentLogin: AuthEvent, userId: string) => {
  // Get last login
  const lastLogin = await getLastLogin(userId);
  
  if (!lastLogin) return;
  
  // Calculate distance between locations
  const distance = calculateDistance(
    lastLogin.geo_location,
    currentLogin.geo_location
  ); // in kilometers
  
  // Calculate time between logins
  const timeDiff = (currentLogin.timestamp.getTime() - lastLogin.timestamp.getTime()) / 1000 / 3600; // hours
  
  // Maximum possible travel speed (assume commercial flight: ~900 km/h)
  const maxSpeed = 900; // km/h
  const minTimeRequired = distance / maxSpeed;
  
  // Alert if travel is impossible
  if (timeDiff < minTimeRequired) {
    await createAlert({
      alert_type: 'impossible_travel',
      severity: 'critical',
      title: 'Impossible Travel Detected',
      details: {
        user_id: userId,
        user_email: currentLogin.user_email,
        distance_km: distance,
        time_diff_hours: timeDiff,
        min_time_required: minTimeRequired,
        location_1: lastLogin.geo_location,
        location_2: currentLogin.geo_location,
        conclusion: `User cannot travel ${distance}km in ${timeDiff} hours`
      },
      ai_confidence: 0.95, // High confidence for physics-based detection
      recommended_actions: [
        'Lock user account immediately',
        'Invalidate all active sessions',
        'Contact user via verified channel',
        'Initiate incident response'
      ]
    });
    
    // Automatic response: Lock account
    await lockUserAccount(userId, 'Impossible travel detected');
  }
};
```

---

### 3.4 Domain 4: Application Security

#### **Scope**
- React web application (frontend)
- Supabase Edge Functions (backend)
- API Gateway
- Third-party integrations

#### **Data Sources**
```typescript
interface ApplicationTelemetry {
  // HTTP Requests
  http_requests: {
    request_id: string;
    timestamp: Date;
    method: string;
    path: string;
    query_params: Record<string, string>;
    headers: Record<string, string>;
    body_size: number;
    
    // Response
    status_code: number;
    response_time_ms: number;
    response_size: number;
    
    // User Context
    user_id?: string;
    session_id?: string;
    source_ip: string;
    user_agent: string;
    
    // Security
    rate_limit_remaining: number;
    auth_method: string;
  }[];
  
  // Application Errors
  errors: {
    error_id: string;
    timestamp: Date;
    error_type: string;
    error_message: string;
    stack_trace: string;
    request_context: any;
    user_id?: string;
    severity: 'fatal' | 'error' | 'warning';
  }[];
  
  // Input Validation Failures
  validation_failures: {
    timestamp: Date;
    field_name: string;
    rejected_value: string;
    validation_rule: string;
    endpoint: string;
    user_id?: string;
  }[];
  
  // Business Logic Events
  business_events: {
    event_type: string;
    timestamp: Date;
    user_id: string;
    details: any;
  }[];
}
```

#### **Threat Detection Scenarios**
1. **SQL Injection**: Detect SQL patterns in input parameters
2. **XSS Attacks**: Detect JavaScript injection attempts
3. **API Abuse**: Rate limiting violations, enumeration attacks
4. **Business Logic Exploitation**: Unusual transaction patterns
5. **Application DDoS**: Sudden spike in requests to specific endpoints

#### **Detection Rules**
```typescript
// WAF-like detection for application attacks
const detectApplicationAttack = (request: HTTPRequest) => {
  const threats = [];
  
  // SQL Injection Detection
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bOR\b.*=.*)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(--|\#|\/\*)/
  ];
  
  const allParams = [
    ...Object.values(request.query_params),
    ...Object.values(request.headers),
    request.body
  ].filter(Boolean);
  
  for (const param of allParams) {
    for (const pattern of sqlPatterns) {
      if (pattern.test(param)) {
        threats.push({
          type: 'sql_injection',
          severity: 'high',
          pattern: pattern.source,
          value: param
        });
      }
    }
  }
  
  // XSS Detection
  const xssPatterns = [
    /<script[^>]*>.*<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i
  ];
  
  for (const param of allParams) {
    for (const pattern of xssPatterns) {
      if (pattern.test(param)) {
        threats.push({
          type: 'xss',
          severity: 'high',
          pattern: pattern.source,
          value: param
        });
      }
    }
  }
  
  // Path Traversal Detection
  if (request.path.includes('../') || request.path.includes('..\\')) {
    threats.push({
      type: 'path_traversal',
      severity: 'high',
      value: request.path
    });
  }
  
  // Create alert if threats detected
  if (threats.length > 0) {
    createAlert({
      alert_type: 'application_attack',
      severity: 'high',
      title: `Application Attack Detected (${threats.length} threats)`,
      details: {
        request_id: request.request_id,
        source_ip: request.source_ip,
        endpoint: `${request.method} ${request.path}`,
        threats: threats,
        user_id: request.user_id
      },
      recommended_actions: [
        'Block source IP',
        'Review WAF rules',
        'Investigate user account (if authenticated)'
      ]
    });
  }
};
```

---

### 3.5 Domain 5: SaaS Security

#### **Scope**
- Email service (Resend)
- AI service (OpenAI)
- Video service (Daily.co)
- Error monitoring (Sentry)
- Other integrated SaaS platforms

#### **Data Sources**
```typescript
interface SaaSTelemetry {
  service_name: string;
  service_type: 'email' | 'ai' | 'video' | 'monitoring' | 'analytics' | 'other';
  
  // API Activity
  api_calls: {
    timestamp: Date;
    api_key_id: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number;
    usage_units: number; // emails sent, tokens used, minutes consumed
    cost_estimate: number;
  }[];
  
  // OAuth Application Activity
  oauth_apps: {
    app_id: string;
    app_name: string;
    permissions_granted: string[];
    authorized_by: string;
    authorized_at: Date;
    last_used: Date;
    data_accessed: string[];
  }[];
  
  // Data Sharing Events
  data_sharing: {
    timestamp: Date;
    data_type: string;
    data_volume: number;
    shared_with: string; // SaaS service
    purpose: string;
    user_consent: boolean;
  }[];
  
  // Security Events
  security_events: {
    timestamp: Date;
    event_type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    affected_resources: string[];
  }[];
}
```

#### **Threat Detection Scenarios**
1. **API Key Leakage**: Unusual usage patterns or locations
2. **OAuth Abuse**: Suspicious application permissions
3. **Data Exfiltration via SaaS**: Unusual data volume sharing
4. **Service Account Compromise**: Abnormal API activity
5. **Cost Anomalies**: Sudden spike in usage/costs

#### **Detection: Shadow SaaS**
```typescript
// Detect unauthorized SaaS usage
const detectShadowSaaS = async () => {
  // Get approved SaaS applications
  const approvedServices = await getApprovedSaaSList();
  
  // Analyze OAuth application grants
  const oauthApps = await getOAuthApplications();
  
  const shadowApps = oauthApps.filter(app => 
    !approvedServices.includes(app.app_name)
  );
  
  if (shadowApps.length > 0) {
    await createAlert({
      alert_type: 'shadow_saas',
      severity: 'medium',
      title: `${shadowApps.length} Unauthorized SaaS Application(s) Detected`,
      details: {
        shadow_apps: shadowApps.map(app => ({
          app_name: app.app_name,
          permissions: app.permissions_granted,
          authorized_by: app.authorized_by,
          data_accessed: app.data_accessed
        }))
      },
      recommended_actions: [
        'Review application legitimacy',
        'Revoke OAuth tokens if unauthorized',
        'Update approved SaaS list',
        'User education on OAuth consent'
      ]
    });
  }
};
```

---

### 3.6 Domain 6: Data Security

#### **Scope**
- PostgreSQL database queries
- Supabase Storage access
- File uploads/downloads
- Data exports
- Backup operations

#### **Data Sources**
```typescript
interface DataSecurityTelemetry {
  // Database Activity
  database_queries: {
    query_id: string;
    timestamp: Date;
    user_id: string;
    database: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALTER' | 'DROP';
    table_name: string;
    affected_rows: number;
    query_text: string;
    execution_time_ms: number;
    
    // Sensitivity Classification
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
    contains_pii: boolean;
    contains_payment_data: boolean;
  }[];
  
  // Storage Access
  storage_access: {
    timestamp: Date;
    user_id: string;
    operation: 'upload' | 'download' | 'delete' | 'list';
    bucket_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    
    // Classification
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  }[];
  
  // Data Exports
  data_exports: {
    export_id: string;
    timestamp: Date;
    user_id: string;
    export_type: 'csv' | 'json' | 'pdf' | 'backup';
    record_count: number;
    file_size: number;
    tables_included: string[];
    destination: string;
  }[];
  
  // Encryption Status
  encryption_events: {
    timestamp: Date;
    resource_id: string;
    resource_type: string;
    encryption_status: 'encrypted' | 'decrypted' | 'key_rotated';
    encryption_algorithm: string;
    key_id: string;
  }[];
}
```

#### **Threat Detection Scenarios**
1. **Data Exfiltration**: Unusual volume of downloads or exports
2. **Insider Threat**: Admin accessing sensitive data outside work hours
3. **Mass Data Deletion**: Bulk DELETE operations
4. **Privilege Escalation via SQL**: Direct table alterations
5. **Unencrypted Data**: Access to unencrypted sensitive data

#### **Detection: Data Exfiltration**
```typescript
// Detect potential data exfiltration
const detectDataExfiltration = async (userId: string, timeWindow: number = 24) => {
  // Get user's typical behavior baseline
  const baseline = await getDataAccessBaseline(userId, 30); // 30-day average
  
  // Get recent activity
  const recentActivity = await getRecentDataAccess(userId, timeWindow);
  
  // Calculate anomaly scores
  const downloadVolume = recentActivity.storage_access
    .filter(a => a.operation === 'download')
    .reduce((sum, a) => sum + a.file_size, 0);
    
  const queryVolume = recentActivity.database_queries
    .filter(q => q.operation === 'SELECT')
    .reduce((sum, q) => sum + q.affected_rows, 0);
    
  const exportCount = recentActivity.data_exports.length;
  
  // Compare to baseline
  const downloadDeviation = (downloadVolume - baseline.avg_download_volume) / baseline.std_download_volume;
  const queryDeviation = (queryVolume - baseline.avg_query_volume) / baseline.std_query_volume;
  const exportDeviation = (exportCount - baseline.avg_export_count) / baseline.std_export_count;
  
  // Alert if significant deviation (3+ standard deviations)
  if (downloadDeviation > 3 || queryDeviation > 3 || exportDeviation > 3) {
    await createAlert({
      alert_type: 'data_exfiltration',
      severity: 'critical',
      title: 'Potential Data Exfiltration Detected',
      details: {
        user_id: userId,
        time_window_hours: timeWindow,
        download_volume_gb: (downloadVolume / 1024 / 1024 / 1024).toFixed(2),
        download_deviation: downloadDeviation.toFixed(2),
        query_volume_rows: queryVolume,
        query_deviation: queryDeviation.toFixed(2),
        export_count: exportCount,
        export_deviation: exportDeviation.toFixed(2),
        baseline: baseline
      },
      ai_confidence: Math.max(downloadDeviation, queryDeviation, exportDeviation) / 10, // Normalize to 0-1
      recommended_actions: [
        'Suspend user account immediately',
        'Review all data accessed in last 48 hours',
        'Contact user via verified channel',
        'Initiate forensic investigation',
        'Review data classification and access controls',
        'Notify DPO if PII involved'
      ]
    });
    
    // Automatic response for high-confidence alerts
    if (downloadDeviation > 5 || queryDeviation > 5) {
      await suspendUserAccount(userId, 'Automatic suspension: Data exfiltration detected');
      await invalidateAllSessions(userId);
    }
  }
};
```

---

## 4. Cross-Domain Correlation

### 4.1 Correlation Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              XDR Correlation Engine                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Step 1: Event Ingestion & Normalization           │   │
│  │   • Collect events from all 6 domains                │   │
│  │   • Normalize to common schema                       │   │
│  │   • Enrich with context (user, asset, geo)           │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Step 2: Temporal Correlation                       │   │
│  │   • Group events by time window (1-60 minutes)       │   │
│  │   • Link events with same user/IP/asset              │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Step 3: Pattern Matching                           │   │
│  │   • Apply predefined attack patterns                 │   │
│  │   • MITRE ATT&CK technique mapping                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Step 4: AI-Powered Analysis                        │   │
│  │   • Machine learning anomaly detection               │   │
│  │   • Behavioral analysis (UEBA)                       │   │
│  │   • Threat intelligence enrichment                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Step 5: Incident Creation                          │   │
│  │   • Create incident from correlated events           │   │
│  │   • Assign severity and priority                     │   │
│  │   • Suggest response actions                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Attack Chain Detection

**Example: Account Takeover Attack**

```
Time: T+0m
Domain: Identity (Domain 3)
Event: Failed login attempt from IP 203.0.113.50
↓ Correlation ID: ATK-2025-001

Time: T+2m
Domain: Identity (Domain 3)
Event: Successful login from same IP after password reset
↓ Same Correlation ID

Time: T+5m
Domain: Application (Domain 4)
Event: Profile update - email changed, 2FA disabled
↓ Same Correlation ID

Time: T+8m
Domain: Data (Domain 6)
Event: Bulk data export initiated
↓ Same Correlation ID

Time: T+10m
XDR ALERT GENERATED:
Title: "Multi-Stage Account Takeover Attack"
Severity: CRITICAL
Confidence: 95%
Affected User: user@example.com
Attack Chain: Login brute force → Password reset → Profile tampering → Data exfiltration
Recommended Actions:
1. Lock account immediately
2. Invalidate all sessions
3. Restore previous email address
4. Re-enable 2FA
5. Review exported data
6. Contact user via verified channel
```

### 4.3 Correlation Rules

```typescript
interface CorrelationRule {
  rule_id: string;
  rule_name: string;
  description: string;
  
  // Event matching criteria
  event_patterns: {
    domain: string;
    event_type: string;
    conditions: Record<string, any>;
  }[];
  
  // Time window for correlation
  time_window_minutes: number;
  
  // Correlation keys
  correlation_keys: ('user_id' | 'source_ip' | 'session_id' | 'device_id')[];
  
  // Severity assignment
  severity_calculation: (events: SecurityEvent[]) => 'critical' | 'high' | 'medium' | 'low';
  
  // MITRE ATT&CK mapping
  mitre_tactics: string[];
  mitre_techniques: string[];
}

// Example correlation rule
const bruteForceToSuccessRule: CorrelationRule = {
  rule_id: 'COR-001',
  rule_name: 'Brute Force Followed by Successful Login',
  description: 'Detects successful login after multiple failed attempts',
  
  event_patterns: [
    {
      domain: 'identity',
      event_type: 'authentication',
      conditions: {
        outcome: 'failure',
        min_count: 5
      }
    },
    {
      domain: 'identity',
      event_type: 'authentication',
      conditions: {
        outcome: 'success',
        min_count: 1
      }
    }
  ],
  
  time_window_minutes: 10,
  correlation_keys: ['source_ip', 'user_email'],
  
  severity_calculation: (events) => {
    const failedCount = events.filter(e => e.outcome === 'failure').length;
    if (failedCount > 10) return 'critical';
    if (failedCount > 5) return 'high';
    return 'medium';
  },
  
  mitre_tactics: ['TA0006'], // Credential Access
  mitre_techniques: ['T1110.001'] // Brute Force: Password Guessing
};
```

---

## 5. AI-Powered Analysis

### 5.1 Machine Learning Models

**Model 1: Anomaly Detection (Unsupervised)**
- **Algorithm**: Isolation Forest
- **Purpose**: Detect unusual patterns in user behavior
- **Input Features**:
  - Login time (hour of day)
  - Login location (lat/lon)
  - Device fingerprint
  - API call frequency
  - Data access volume
- **Output**: Anomaly score (0-1)
- **Retraining**: Weekly on 90-day rolling window

**Model 2: Threat Classification (Supervised)**
- **Algorithm**: Random Forest Classifier
- **Purpose**: Classify security events as benign/malicious
- **Input Features**:
  - Event type and domain
  - User risk score
  - Source IP reputation
  - Time of day
  - Access patterns
- **Output**: Threat probability (0-1) + category
- **Training Data**: Historical labeled incidents
- **Accuracy Target**: > 95%

**Model 3: Attack Pattern Recognition (Deep Learning)**
- **Algorithm**: LSTM Neural Network
- **Purpose**: Detect multi-stage attack sequences
- **Input**: Time-series of security events
- **Output**: Attack chain probability + MITRE technique
- **Training**: Transfer learning from public datasets

### 5.2 AI Agent Integration

```typescript
interface AIAnalysisRequest {
  events: SecurityEvent[];
  correlation_id?: string;
  analysis_type: 'anomaly_detection' | 'threat_classification' | 'attack_pattern' | 'root_cause';
  context: {
    user_profile?: UserBehaviorProfile;
    asset_profile?: AssetProfile;
    threat_intelligence?: ThreatIntelligenceItem[];
  };
}

interface AIAnalysisResult {
  analysis_id: string;
  timestamp: Date;
  
  // Findings
  is_malicious: boolean;
  confidence: number; // 0-1
  risk_score: number; // 0-100
  
  // Classification
  threat_category?: string;
  attack_techniques?: string[]; // MITRE ATT&CK IDs
  
  // Explanation
  reasoning: string;
  evidence: {
    indicator: string;
    weight: number;
    description: string;
  }[];
  
  // Recommendations
  recommended_actions: {
    action: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    automation_available: boolean;
  }[];
  
  // Model metadata
  model_version: string;
  processing_time_ms: number;
}

// AI analysis implementation
const analyzeWithAI = async (request: AIAnalysisRequest): Promise<AIAnalysisResult> => {
  // Call OpenAI API for analysis
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a cybersecurity AI agent analyzing security events for threats. 
        Analyze the provided events and determine if they represent malicious activity.
        Consider: temporal patterns, user behavior baselines, threat intelligence, and MITRE ATT&CK framework.
        Provide structured analysis with confidence scores and recommended actions.`
      },
      {
        role: 'user',
        content: JSON.stringify({
          events: request.events,
          context: request.context,
          analysis_type: request.analysis_type
        })
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  const analysis = JSON.parse(response.choices[0].message.content);
  
  // Log AI analysis
  await logAIOperation({
    agent_type: 'analysis',
    action: request.analysis_type,
    input_data: request,
    output_data: analysis,
    confidence_score: analysis.confidence
  });
  
  return analysis;
};
```

---

## 6. Response Orchestration

### 6.1 Automated Response Matrix

| Threat Type | Severity | Automated Actions | Human Review Required |
|-------------|----------|-------------------|----------------------|
| Brute Force | High | Block IP, Lock account | No (if confidence > 90%) |
| Account Takeover | Critical | Lock account, Invalidate sessions, Notify user | Yes (within 15 min) |
| Data Exfiltration | Critical | Suspend account, Block data export, Alert DPO | Yes (immediate) |
| Malware Execution | Critical | Isolate endpoint, Kill process, Scan system | Yes (immediate) |
| SQL Injection | High | Block IP, Disable endpoint | Yes (within 30 min) |
| Impossible Travel | Critical | Lock account, MFA re-verification | No (if confidence > 95%) |

### 6.2 Response Playbook Example

```yaml
playbook_name: "XDR Account Takeover Response"
playbook_id: "XDR-PB-002"
trigger:
  correlation_rule: "Multi-domain account compromise"
  min_confidence: 0.85

steps:
  - step: 1
    name: "Immediate Containment"
    execution: "parallel"
    actions:
      - action: "lock_user_account"
        parameters:
          user_id: "{{ incident.affected_user }}"
          reason: "Potential account takeover"
      
      - action: "invalidate_sessions"
        parameters:
          user_id: "{{ incident.affected_user }}"
          all_devices: true
      
      - action: "block_source_ip"
        parameters:
          ip_address: "{{ incident.source_ip }}"
          duration: "24 hours"
    
  - step: 2
    name: "Evidence Collection"
    execution: "sequential"
    actions:
      - action: "collect_user_activity"
        parameters:
          user_id: "{{ incident.affected_user }}"
          time_range: "48 hours"
      
      - action: "collect_ip_activity"
        parameters:
          ip_address: "{{ incident.source_ip }}"
          time_range: "24 hours"
      
      - action: "check_data_exfiltration"
        parameters:
          user_id: "{{ incident.affected_user }}"
          time_range: "24 hours"
    
  - step: 3
    name: "User Notification"
    execution: "sequential"
    actions:
      - action: "send_email"
        parameters:
          to: "{{ incident.user_email_verified }}"
          template: "account_compromise_alert"
          include_incident_id: true
      
      - action: "send_sms"
        parameters:
          to: "{{ incident.user_phone_verified }}"
          message: "Your Kumii account has been locked due to suspicious activity. Check your email."
    
  - step: 4
    name: "Security Team Alert"
    execution: "parallel"
    actions:
      - action: "create_incident_ticket"
        parameters:
          severity: "critical"
          assigned_to: "SOC Team"
      
      - action: "send_slack_alert"
        parameters:
          channel: "#security-alerts"
          priority: "high"
      
      - action: "notify_on_call"
        condition: "incident.severity == 'critical'"
        parameters:
          escalation_policy: "security_team"

recovery_steps:
  - "User must reset password via verified email"
  - "User must complete MFA enrollment"
  - "Security team reviews activity log before account unlock"
  - "Monitor user activity for 7 days post-incident"
```

---

## 7. Data Collection Architecture

### 7.1 Collection Methods

```
┌─────────────────────────────────────────────────────────────┐
│            Data Collection Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Endpoints (Domain 1)                               │    │
│  │  Method: Agent-based collection                     │    │
│  │  • Install endpoint agent on devices                │    │
│  │  • Real-time telemetry streaming                    │    │
│  │  • Buffering for offline scenarios                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Cloud/Identity/App (Domains 2,3,4)                 │    │
│  │  Method: API polling & webhooks                     │    │
│  │  • Poll cloud provider APIs every 5 minutes         │    │
│  │  • Subscribe to webhook events (real-time)          │    │
│  │  • Parse structured logs                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SaaS (Domain 5)                                     │    │
│  │  Method: API integration & log forwarding           │    │
│  │  • OAuth-based API access                           │    │
│  │  • Log forwarding to SIEM                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Data (Domain 6)                                     │    │
│  │  Method: Database audit logs                        │    │
│  │  • PostgreSQL pgaudit extension                     │    │
│  │  • Supabase Storage webhooks                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Centralized Data Lake (SIEM)                 │    │
│  │  • Hot tier: Last 30 days (fast queries)            │    │
│  │  • Warm tier: 30 days - 1 year (medium speed)       │    │
│  │  • Cold tier: 1-7 years (slow, compliance)          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Data Retention Policy

| Data Type | Hot Storage | Warm Storage | Cold Storage | Total Retention |
|-----------|-------------|--------------|--------------|-----------------|
| Authentication Events | 30 days | 11 months | 6 years | 7 years |
| API Access Logs | 30 days | 11 months | 6 years | 7 years |
| Database Audit Logs | 30 days | 11 months | 6 years | 7 years |
| Endpoint Telemetry | 30 days | 5 months | 0 | 6 months |
| Application Errors | 30 days | 11 months | 0 | 1 year |
| Security Incidents | 30 days | 11 months | 6 years | 7 years |
| AI Analysis Results | 30 days | 11 months | 6 years | 7 years |

---

## 8. Integration Points

### 8.1 External Integrations

**Threat Intelligence Feeds**:
- MITRE ATT&CK CTI
- CISA Known Exploited Vulnerabilities
- Abuse.ch (malware, botnet IPs)
- VirusTotal API
- Custom threat feeds

**SIEM Platforms** (future):
- Splunk
- Elastic Security
- Microsoft Sentinel
- Sumo Logic

**Ticketing Systems**:
- Jira
- ServiceNow
- PagerDuty

**Communication Channels**:
- Slack
- Microsoft Teams
- Email (Resend)
- SMS

---

## 9. Implementation Strategy

### Phase 1: Foundation (Weeks 1-2) ✅
- [x] XDR architecture documentation
- [ ] Database schema deployment
- [ ] Basic log collection setup

### Phase 2: Domain Coverage (Weeks 3-6)
- [ ] Week 3: Identity & Access monitoring (Domain 3)
- [ ] Week 4: Application security monitoring (Domain 4)
- [ ] Week 5: Data security monitoring (Domain 6)
- [ ] Week 6: Cloud infrastructure monitoring (Domain 2)

### Phase 3: Correlation (Weeks 7-8)
- [ ] Deploy correlation engine
- [ ] Implement 10+ correlation rules
- [ ] Test cross-domain attack detection

### Phase 4: AI Integration (Weeks 9-10)
- [ ] Deploy anomaly detection models
- [ ] Integrate threat classification
- [ ] Implement attack pattern recognition

### Phase 5: Response Automation (Weeks 11-12)
- [ ] Build automated response playbooks
- [ ] Test incident response workflows
- [ ] User acceptance testing

---

## Appendix A: Database Schemas

```sql
-- XDR events table (unified schema)
CREATE TABLE xdr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Domain classification
  domain TEXT NOT NULL CHECK (domain IN ('endpoint', 'cloud', 'identity', 'application', 'saas', 'data')),
  event_type TEXT NOT NULL,
  sub_type TEXT,
  
  -- Common fields
  user_id UUID REFERENCES auth.users(id),
  source_ip INET,
  destination_ip INET,
  asset_id UUID,
  
  -- Event details (flexible JSON)
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Correlation
  correlation_id UUID,
  parent_event_id UUID REFERENCES xdr_events(id),
  
  -- Analysis
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  ai_analyzed BOOLEAN DEFAULT false,
  ai_risk_score FLOAT CHECK (ai_risk_score BETWEEN 0 AND 1),
  ai_threat_category TEXT,
  mitre_techniques TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  ingested_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_xdr_events_timestamp ON xdr_events(event_timestamp DESC);
CREATE INDEX idx_xdr_events_domain ON xdr_events(domain, event_timestamp DESC);
CREATE INDEX idx_xdr_events_user ON xdr_events(user_id, event_timestamp DESC);
CREATE INDEX idx_xdr_events_ip ON xdr_events(source_ip, event_timestamp DESC);
CREATE INDEX idx_xdr_events_correlation ON xdr_events(correlation_id);
CREATE INDEX idx_xdr_events_severity ON xdr_events(severity, event_timestamp DESC) WHERE severity IN ('critical', 'high');

-- Correlation rules table
CREATE TABLE xdr_correlation_rules (
  rule_id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  
  -- Rule definition
  event_patterns JSONB NOT NULL,
  time_window_minutes INTEGER NOT NULL,
  correlation_keys TEXT[] NOT NULL,
  
  -- Severity logic
  severity_calculation TEXT NOT NULL, -- Function name
  
  -- MITRE mapping
  mitre_tactics TEXT[],
  mitre_techniques TEXT[],
  
  -- Statistics
  triggered_count INTEGER DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  false_positive_rate FLOAT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

---

**End of Document**

**Next Steps**: Proceed to Task 4 - AI-Augmented Workforce Model
