# Data Analytics Framework for Security Operations

**Document Version:** 1.0  
**Date:** December 1, 2025  
**Status:** Active  
**ISO/IEC 27001:2022 Alignment:** A.8.15, A.8.16, A.12.4

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Collection Architecture](#2-data-collection-architecture)
3. [Log Sources & Collection Strategy](#3-log-sources--collection-strategy)
4. [AI Model Input Pipeline](#4-ai-model-input-pipeline)
5. [Behavioral Profiling](#5-behavioral-profiling)
6. [Anomaly Detection Rules](#6-anomaly-detection-rules)
7. [Data Processing & Enrichment](#7-data-processing--enrichment)
8. [Storage & Retention](#8-storage--retention)
9. [Analytics Use Cases](#9-analytics-use-cases)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Executive Summary

### 1.1 Purpose

This framework defines the data collection, processing, and analytics strategy for Sloane Catalyst Hub's Security Operations Center. It provides the foundation for AI-powered threat detection, behavioral profiling, and anomaly detection.

### 1.2 Scope

**Data Sources:** 25+ log sources across 6 detection domains  
**Collection Volume:** ~500GB/day estimated (at scale)  
**Processing Latency:** < 5 seconds (real-time)  
**Retention:** 90 days hot, 2 years cold  
**AI Model Training:** Daily refresh with 30-day rolling window

### 1.3 Key Objectives

1. **Unified Visibility** - Collect logs from all security-relevant sources
2. **Real-Time Processing** - Process and analyze logs within 5 seconds
3. **AI-Ready Data** - Format data for machine learning model consumption
4. **Behavioral Baselines** - Profile normal user/entity behavior patterns
5. **Anomaly Detection** - Identify deviations from baseline behavior
6. **Compliance** - Meet ISO 27001 logging and monitoring requirements

---

## 2. Data Collection Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Endpoint   │    Cloud     │   Identity   │   Application      │
│   • EDR      │   • CloudTrail│   • Auth    │   • App Logs       │
│   • Syslog   │   • Azure    │   • AD/Entra│   • API Gateway    │
│   • Windows  │   • GCP      │   • OAuth    │   • Webhooks       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOG COLLECTORS                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Fluentd   │  │  Logstash  │  │   Vector   │                │
│  │  (Unified) │  │  (Legacy)  │  │  (Modern)  │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
└────────┼───────────────┼───────────────┼─────────────────────────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE                                 │
│               Apache Kafka / Supabase Realtime                   │
│  • High throughput (100K+ events/sec)                           │
│  • Event ordering and partitioning                              │
│  • Buffer for downstream processing                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STREAM PROCESSING                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Edge Functions                      │  │
│  │  • Normalization  • Enrichment  • Filtering              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
        ┌────────────┐ ┌──────────┐ ┌─────────────┐
        │ PostgreSQL │ │ AI Models│ │   Alerts    │
        │  (Supabase)│ │ (OpenAI) │ │  (Realtime) │
        └────────────┘ └──────────┘ └─────────────┘
```

### 2.2 Collection Principles

**1. Collect Once, Use Many Times**
- Centralized collection reduces overhead
- Single source of truth for all security events
- Reusable data for multiple analytics use cases

**2. Normalize at Ingestion**
- Convert all logs to common schema (ECS - Elastic Common Schema)
- Consistent field names across all sources
- Easier correlation and analysis

**3. Enrich Early**
- Add context during collection (geolocation, threat intel)
- Reduces query-time processing
- Improves detection speed

**4. Filter Intelligently**
- Drop low-value logs at collection (health checks, verbosity)
- Reduces storage costs by 60-70%
- Focus on security-relevant events

---

## 3. Log Sources & Collection Strategy

### 3.1 Source Inventory

#### Endpoint Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **Windows Event Logs** | Security, System, Application | 50GB | High | Fluentd agent |
| **macOS Unified Logs** | System, Security | 20GB | High | Fluentd agent |
| **Linux Syslog** | Auth, Kernel, Application | 30GB | High | rsyslog → Kafka |
| **EDR Telemetry** | Process, Network, File | 100GB | Critical | API integration |
| **Antivirus Logs** | Detections, Scans | 5GB | Medium | Syslog forwarding |

#### Cloud Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **AWS CloudTrail** | API calls, Resource changes | 40GB | High | S3 → Lambda → Kafka |
| **Azure Activity Logs** | Resource operations | 30GB | High | Event Hub → Kafka |
| **GCP Audit Logs** | Admin, Data access | 25GB | High | Pub/Sub → Kafka |
| **Supabase Logs** | Auth, Database, Functions | 15GB | Critical | Postgres logs |

#### Identity Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **Supabase Auth** | Login, Logout, MFA | 10GB | Critical | Database triggers |
| **Google OAuth** | Authorization events | 5GB | High | Webhook |
| **AD/Entra ID** | Authentication, Directory | 20GB | High | API polling |
| **LDAP** | Bind, Search, Modify | 8GB | Medium | Syslog |

#### Application Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **App Server Logs** | Requests, Errors, Performance | 60GB | High | Fluentd sidecar |
| **API Gateway** | Requests, Rate limits | 40GB | High | CloudWatch Logs |
| **Database Queries** | Slow queries, Errors | 15GB | Medium | Postgres logs |
| **Edge Functions** | Invocations, Errors | 20GB | High | Supabase logs |

#### Network Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **Firewall Logs** | Allow, Deny, NAT | 80GB | High | Syslog → Kafka |
| **IDS/IPS Alerts** | Signatures, Anomalies | 30GB | Critical | SIEM integration |
| **DNS Queries** | Requests, Responses | 50GB | Medium | DNS server logs |
| **Proxy Logs** | Web requests, Blocks | 40GB | Medium | Squid logs |

#### Data Detection Domain

| Source | Log Type | Volume/Day | Priority | Collection Method |
|--------|----------|------------|----------|-------------------|
| **DLP Alerts** | Policy violations | 5GB | Critical | API integration |
| **File Access** | Open, Modify, Delete | 35GB | High | Audit logs |
| **Email Gateway** | Spam, Phishing, Malware | 20GB | High | SMTP logs |
| **Cloud Storage** | S3/Blob access logs | 25GB | Medium | Cloud native logs |

### 3.2 Common Log Schema (Elastic Common Schema)

**Base Fields (all events):**
```json
{
  "@timestamp": "2025-12-01T10:30:45.123Z",
  "event": {
    "kind": "event",              // event, alert, metric, state
    "category": ["authentication"], // authentication, network, file, process
    "type": ["start"],            // start, end, creation, deletion, access
    "action": "login-success",
    "outcome": "success",         // success, failure, unknown
    "severity": 3,                // 0=emergency, 7=debug
    "dataset": "supabase.auth",
    "module": "authentication"
  },
  "source": {
    "ip": "203.0.113.50",
    "geo": {
      "country_name": "South Africa",
      "city_name": "Johannesburg"
    }
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "alice@example.com",
    "roles": ["user"]
  },
  "host": {
    "name": "web-server-01",
    "os": { "family": "linux", "version": "Ubuntu 22.04" }
  },
  "agent": {
    "type": "fluentd",
    "version": "1.16.0"
  }
}
```

**Authentication Event:**
```json
{
  "@timestamp": "2025-12-01T10:30:45.123Z",
  "event": {
    "kind": "event",
    "category": ["authentication"],
    "type": ["start"],
    "action": "login-success",
    "outcome": "success"
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "source": {
    "ip": "203.0.113.50",
    "geo": { "country": "ZA", "city": "Johannesburg" }
  },
  "user_agent": {
    "original": "Mozilla/5.0...",
    "name": "Chrome",
    "version": "120.0"
  },
  "authentication": {
    "method": "password",
    "mfa_enabled": true,
    "mfa_verified": true,
    "risk_score": 15
  }
}
```

**Network Event:**
```json
{
  "@timestamp": "2025-12-01T10:30:45.123Z",
  "event": {
    "kind": "event",
    "category": ["network"],
    "type": ["connection"],
    "action": "firewall-allow",
    "outcome": "success"
  },
  "source": {
    "ip": "192.168.1.100",
    "port": 54321,
    "bytes": 1024
  },
  "destination": {
    "ip": "203.0.113.50",
    "port": 443,
    "bytes": 2048
  },
  "network": {
    "protocol": "tcp",
    "direction": "outbound",
    "bytes": 3072,
    "packets": 24
  }
}
```

### 3.3 Collection Configuration

**Fluentd Configuration Example:**
```yaml
# /etc/fluentd/fluent.conf

# Input: Supabase Auth Logs
<source>
  @type tail
  path /var/log/supabase/auth.log
  pos_file /var/log/fluentd/supabase-auth.pos
  tag supabase.auth
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%L%z
  </parse>
</source>

# Filter: Normalize to ECS
<filter supabase.auth>
  @type record_transformer
  enable_ruby true
  <record>
    @timestamp ${time.iso8601}
    event.kind "event"
    event.category ["authentication"]
    event.dataset "supabase.auth"
    source.ip ${record["ip_address"]}
    user.id ${record["user_id"]}
    user.email ${record["email"]}
  </record>
</filter>

# Filter: Enrich with Geolocation
<filter supabase.auth>
  @type geoip
  geoip_lookup_keys source.ip
  <record>
    source.geo.country_name ${country_name}
    source.geo.city_name ${city_name}
    source.geo.location.lat ${latitude}
    source.geo.location.lon ${longitude}
  </record>
</filter>

# Output: Supabase PostgreSQL
<match supabase.**>
  @type sql
  host db.supabase.co
  port 5432
  database postgres
  adapter postgresql
  username postgres
  password ${ENV['DB_PASSWORD']}
  
  <table>
    table security_events
    column_mapping '@timestamp:timestamp,event:jsonb,source:jsonb,user:jsonb'
  </table>
</match>

# Output: Kafka (for stream processing)
<match **>
  @type kafka2
  brokers kafka-broker:9092
  topic_key security-events
  <format>
    @type json
  </format>
  <buffer>
    flush_interval 1s
  </buffer>
</match>
```

---

## 4. AI Model Input Pipeline

### 4.1 Data Transformation for AI

**Input Requirements:**
- **Format:** JSON with standardized fields
- **Completeness:** No missing critical fields (user_id, timestamp, action)
- **Timeliness:** < 5 seconds from event occurrence to AI processing
- **Context:** Enriched with threat intel, geolocation, user baseline

**Feature Engineering:**
```typescript
// Transform raw event into AI model input
interface AIModelInput {
  // Temporal features
  timestamp: number;            // Unix timestamp
  hour_of_day: number;         // 0-23
  day_of_week: number;         // 0-6 (Monday=0)
  is_business_hours: boolean;   // 8am-6pm Mon-Fri
  
  // User features
  user_id: string;
  user_role: string;            // admin, user, service_account
  user_risk_score: number;      // 0-100
  user_login_velocity: number;  // Logins per hour
  
  // Behavioral features
  is_new_device: boolean;
  is_new_ip: boolean;
  is_new_location: boolean;
  days_since_last_login: number;
  
  // Network features
  source_ip: string;
  source_country: string;
  is_vpn: boolean;
  is_tor: boolean;
  ip_reputation_score: number;  // 0-100
  
  // Event features
  event_type: string;           // login, file_access, api_call
  event_category: string;       // authentication, data, network
  event_severity: number;       // 0-7
  
  // Historical features (from baseline)
  typical_login_time_deviation: number;  // Minutes from normal
  typical_location_distance: number;     // KM from normal location
  typical_device_similarity: number;     // 0-1 (Jaccard similarity)
  
  // Sequence features
  previous_action: string;
  previous_action_timestamp: number;
  action_sequence_anomaly_score: number; // Based on Markov chain
}
```

**Feature Extraction Function:**
```typescript
async function extractAIFeatures(event: SecurityEvent): Promise<AIModelInput> {
  // Get user baseline
  const baseline = await getUserBaseline(event.user.id);
  
  // Calculate temporal features
  const eventTime = new Date(event['@timestamp']);
  const hour = eventTime.getHours();
  const dayOfWeek = eventTime.getDay();
  const isBusinessHours = (hour >= 8 && hour < 18) && (dayOfWeek >= 1 && dayOfWeek <= 5);
  
  // Calculate behavioral features
  const isNewDevice = await isDeviceNew(event.user.id, event.user_agent);
  const isNewIP = await isIPNew(event.user.id, event.source.ip);
  const isNewLocation = await isLocationNew(event.user.id, event.source.geo);
  
  // Calculate deviations from baseline
  const typicalLoginTime = baseline.typical_login_hours.find(h => h === hour) !== undefined;
  const timeDeviation = typicalLoginTime ? 0 : Math.abs(hour - baseline.most_common_hour);
  
  const locationDistance = calculateDistance(
    baseline.typical_location,
    event.source.geo.location
  );
  
  return {
    timestamp: eventTime.getTime(),
    hour_of_day: hour,
    day_of_week: dayOfWeek,
    is_business_hours: isBusinessHours,
    user_id: event.user.id,
    user_role: event.user.roles[0],
    user_risk_score: baseline.risk_score,
    user_login_velocity: await getLoginVelocity(event.user.id),
    is_new_device: isNewDevice,
    is_new_ip: isNewIP,
    is_new_location: isNewLocation,
    days_since_last_login: baseline.days_since_last_login,
    source_ip: event.source.ip,
    source_country: event.source.geo.country_name,
    is_vpn: event.source.is_vpn || false,
    is_tor: event.source.is_tor || false,
    ip_reputation_score: await getIPReputation(event.source.ip),
    event_type: event.event.action,
    event_category: event.event.category[0],
    event_severity: event.event.severity,
    typical_login_time_deviation: timeDeviation,
    typical_location_distance: locationDistance,
    typical_device_similarity: await calculateDeviceSimilarity(
      event.user_agent,
      baseline.typical_devices
    ),
    previous_action: baseline.last_action,
    previous_action_timestamp: baseline.last_action_timestamp,
    action_sequence_anomaly_score: await calculateSequenceAnomalyScore(
      event.user.id,
      event.event.action
    ),
  };
}
```

### 4.2 Real-Time Inference Pipeline

**Stream Processing Flow:**
```
Event Ingestion → Feature Extraction → Model Inference → Risk Scoring → Alert Generation
     (< 1s)            (< 2s)              (< 1s)           (< 0.5s)        (< 0.5s)
                                                                           
Total Latency: < 5 seconds end-to-end
```

**Batch vs Stream Processing:**

| Processing Mode | Use Case | Latency | Data Freshness |
|----------------|----------|---------|----------------|
| **Stream** | Real-time detection, alerts | < 5s | Real-time |
| **Micro-batch** | Behavioral profiling, trending | 1-5 min | Near real-time |
| **Batch** | Model training, reporting | Daily | Historical |

---

## 5. Behavioral Profiling

### 5.1 User Behavior Baselines

**Profile Components:**
```typescript
interface UserBehaviorBaseline {
  user_id: string;
  profile_version: number;
  created_at: Date;
  updated_at: Date;
  
  // Temporal patterns
  typical_login_hours: number[];        // [8, 9, 10, 14, 15, 16]
  typical_login_days: number[];         // [1, 2, 3, 4, 5] (Mon-Fri)
  most_common_hour: number;             // 9 (9am)
  login_frequency: number;              // 2.5 logins per day
  
  // Geographic patterns
  typical_location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  location_variance_radius_km: number;  // 50km typical variance
  
  // Device patterns
  typical_devices: Array<{
    fingerprint: string;
    os: string;
    browser: string;
    last_seen: Date;
    frequency: number;               // % of logins from this device
  }>;
  
  // Network patterns
  typical_ips: Array<{
    ip: string;
    isp: string;
    first_seen: Date;
    last_seen: Date;
    frequency: number;
  }>;
  
  // Behavioral patterns
  typical_actions: Array<{
    action: string;
    frequency: number;              // Times per day
    typical_sequence: string[];     // Common action sequences
  }>;
  
  // Risk indicators
  risk_score: number;                // 0-100 baseline risk
  failed_login_rate: number;         // % of logins that fail
  mfa_compliance: boolean;
  last_password_change: Date;
  
  // Activity patterns
  avg_session_duration_minutes: number;
  avg_api_calls_per_session: number;
  typical_data_access_volume_mb: number;
  
  // Anomaly history
  anomaly_count_30d: number;
  false_positive_rate: number;      // For model tuning
  
  // Metadata
  days_since_first_login: number;
  days_since_last_login: number;
  total_login_count: number;
  last_action: string;
  last_action_timestamp: number;
}
```

**Baseline Calculation (Daily Job):**
```sql
-- Calculate user behavior baseline
CREATE OR REPLACE FUNCTION calculate_user_baseline(p_user_id UUID)
RETURNS user_behavior_baseline
LANGUAGE plpgsql
AS $$
DECLARE
  v_baseline user_behavior_baseline;
BEGIN
  -- Calculate temporal patterns (last 30 days)
  SELECT
    array_agg(DISTINCT EXTRACT(HOUR FROM created_at)::INTEGER) as typical_login_hours,
    array_agg(DISTINCT EXTRACT(DOW FROM created_at)::INTEGER) as typical_login_days,
    mode() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM created_at)) as most_common_hour,
    COUNT(*)::FLOAT / 30.0 as login_frequency
  INTO
    v_baseline.typical_login_hours,
    v_baseline.typical_login_days,
    v_baseline.most_common_hour,
    v_baseline.login_frequency
  FROM auth_events
  WHERE user_id = p_user_id
    AND event_type = 'login_success'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate geographic patterns
  SELECT
    AVG(ST_Y(geolocation)) as latitude,
    AVG(ST_X(geolocation)) as longitude,
    mode() WITHIN GROUP (ORDER BY city) as city,
    mode() WITHIN GROUP (ORDER BY country) as country,
    STDDEV(ST_Distance(geolocation, AVG(geolocation))) / 1000.0 as variance_km
  INTO
    v_baseline.typical_location.latitude,
    v_baseline.typical_location.longitude,
    v_baseline.typical_location.city,
    v_baseline.typical_location.country,
    v_baseline.location_variance_radius_km
  FROM auth_context_log
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate device patterns
  SELECT json_agg(device_stats ORDER BY frequency DESC)
  INTO v_baseline.typical_devices
  FROM (
    SELECT
      device_fingerprint as fingerprint,
      COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () as frequency,
      MAX(created_at) as last_seen
    FROM auth_context_log
    WHERE user_id = p_user_id
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY device_fingerprint
  ) device_stats;
  
  -- Return baseline
  RETURN v_baseline;
END;
$$;
```

### 5.2 Entity Behavior Baselines

**Beyond Users - Profile Everything:**
- **Service Accounts:** API call patterns, typical endpoints, data volumes
- **Applications:** Request rates, error rates, resource consumption
- **Hosts:** Process patterns, network connections, file access
- **IP Addresses:** Request patterns, target services, geographic origin

**Service Account Baseline Example:**
```typescript
interface ServiceAccountBaseline {
  account_id: string;
  
  // API patterns
  typical_endpoints: Array<{
    endpoint: string;
    method: string;
    frequency: number;        // Calls per hour
    typical_response_time_ms: number;
  }>;
  
  // Temporal patterns
  typical_active_hours: number[];
  requests_per_hour_avg: number;
  requests_per_hour_stddev: number;
  
  // Data patterns
  avg_payload_size_bytes: number;
  avg_response_size_bytes: number;
  typical_data_volume_gb_per_day: number;
  
  // Error patterns
  typical_error_rate: number;    // 1-2% normal
  typical_timeout_rate: number;
  
  // Security patterns
  typical_source_ips: string[];
  uses_ip_allowlist: boolean;
  rotates_keys_regularly: boolean;
}
```

---

## 6. Anomaly Detection Rules

### 6.1 Statistical Anomaly Detection

**Z-Score Method:**
```typescript
function calculateZScore(value: number, mean: number, stddev: number): number {
  if (stddev === 0) return 0;
  return (value - mean) / stddev;
}

function isStatisticalAnomaly(
  value: number,
  baseline: { mean: number; stddev: number },
  threshold: number = 3.0  // 3 standard deviations
): boolean {
  const zScore = calculateZScore(value, baseline.mean, baseline.stddev);
  return Math.abs(zScore) > threshold;
}

// Example: Detect unusual login frequency
const loginCount = await getLoginCountLastHour(userId);
const baseline = await getUserBaseline(userId);

if (isStatisticalAnomaly(loginCount, {
  mean: baseline.login_frequency,
  stddev: baseline.login_frequency_stddev
}, 3.0)) {
  // Alert: Unusual login velocity
  createAlert({
    type: 'statistical_anomaly',
    message: `User ${userId} has ${loginCount} logins in past hour (normal: ${baseline.login_frequency})`,
    severity: 'medium',
  });
}
```

**IQR (Interquartile Range) Method:**
```typescript
function detectOutliersIQR(values: number[]): number[] {
  const sorted = values.sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(v => v < lowerBound || v > upperBound);
}
```

### 6.2 Rule-Based Anomaly Detection

**Pre-Defined Anomaly Rules:**

```typescript
const ANOMALY_RULES = [
  // Authentication anomalies
  {
    id: 'AUTH-001',
    name: 'Impossible Travel',
    description: 'User logged in from two locations too far apart in too short a time',
    severity: 'high',
    condition: (event, baseline) => {
      const lastLocation = baseline.last_location;
      const currentLocation = event.source.geo.location;
      const timeDiff = event.timestamp - baseline.last_login_timestamp;
      
      const distance = calculateDistance(lastLocation, currentLocation);
      const maxPossibleDistance = (timeDiff / 3600) * 900; // 900 km/h (airplane)
      
      return distance > maxPossibleDistance;
    },
  },
  
  // Data access anomalies
  {
    id: 'DATA-001',
    name: 'Unusual Data Exfiltration Volume',
    description: 'User downloaded significantly more data than normal',
    severity: 'critical',
    condition: (event, baseline) => {
      const dataVolume = event.data.bytes_transferred;
      const threshold = baseline.typical_data_volume_mb * 10; // 10x normal
      
      return dataVolume > threshold * 1024 * 1024;
    },
  },
  
  // Privilege escalation anomalies
  {
    id: 'PRIV-001',
    name: 'Unexpected Admin Action',
    description: 'Non-admin user performed admin action',
    severity: 'critical',
    condition: (event, baseline) => {
      const isAdminAction = event.event.category.includes('administrative');
      const isAdminUser = baseline.user_role === 'admin';
      
      return isAdminAction && !isAdminUser;
    },
  },
  
  // Temporal anomalies
  {
    id: 'TIME-001',
    name: 'Off-Hours Access',
    description: 'User accessed system during unusual hours',
    severity: 'medium',
    condition: (event, baseline) => {
      const hour = new Date(event.timestamp).getHours();
      const isTypical = baseline.typical_login_hours.includes(hour);
      
      // Alert only if accessing sensitive resources
      return !isTypical && event.resource.sensitivity === 'high';
    },
  },
  
  // Network anomalies
  {
    id: 'NET-001',
    name: 'Connection to Malicious IP',
    description: 'Outbound connection to known malicious IP',
    severity: 'critical',
    condition: (event, baseline) => {
      return event.destination.ip_reputation === 'malicious';
    },
  },
  
  // Behavioral anomalies
  {
    id: 'BEH-001',
    name: 'Unusual Action Sequence',
    description: 'User performed actions in unexpected order',
    severity: 'medium',
    condition: (event, baseline) => {
      const sequence = [baseline.last_action, event.event.action];
      const markovProb = calculateMarkovProbability(baseline.action_markov, sequence);
      
      return markovProb < 0.01; // Less than 1% probability
    },
  },
];
```

### 6.3 Machine Learning Anomaly Detection

**ML Models for Anomaly Detection:**

1. **Isolation Forest** - Detects outliers by isolating anomalous data points
2. **One-Class SVM** - Learns normal behavior boundary, flags anything outside
3. **Autoencoder** - Neural network that learns to reconstruct normal patterns
4. **LSTM** - Sequence modeling for detecting unusual action sequences

**Model Training Pipeline:**
```typescript
// Pseudo-code for ML anomaly detection
async function trainAnomalyDetectionModel(userId: string): Promise<Model> {
  // 1. Fetch 30 days of normal behavior data
  const trainingData = await fetchUserEvents(userId, {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    excludeAnomalies: true,  // Only train on normal data
  });
  
  // 2. Extract features
  const features = trainingData.map(extractAIFeatures);
  
  // 3. Train Isolation Forest model
  const model = new IsolationForest({
    nEstimators: 100,
    contamination: 0.01,  // Expect 1% anomalies
  });
  
  await model.fit(features);
  
  // 4. Save model
  await saveModel(userId, model);
  
  return model;
}

// Inference: Detect anomaly
async function detectAnomalyML(event: SecurityEvent): Promise<AnomalyResult> {
  const model = await loadModel(event.user.id);
  const features = await extractAIFeatures(event);
  
  const prediction = await model.predict(features);
  const anomalyScore = await model.score(features);
  
  return {
    is_anomaly: prediction === -1,  // -1 = anomaly, 1 = normal
    anomaly_score: anomalyScore,    // 0.0-1.0
    confidence: Math.abs(anomalyScore),
  };
}
```

### 6.4 Anomaly Scoring

**Composite Anomaly Score:**
```typescript
function calculateCompositeAnomalyScore(event: SecurityEvent, baseline: UserBehaviorBaseline): number {
  let score = 0;
  const weights = {
    statistical: 0.3,
    rule_based: 0.4,
    ml_based: 0.3,
  };
  
  // Statistical score (Z-score based)
  const statisticalScore = calculateStatisticalAnomalyScore(event, baseline);
  score += statisticalScore * weights.statistical;
  
  // Rule-based score
  const ruleMatches = ANOMALY_RULES.filter(rule => rule.condition(event, baseline));
  const ruleScore = Math.min(ruleMatches.length / ANOMALY_RULES.length, 1.0);
  score += ruleScore * weights.rule_based;
  
  // ML-based score
  const mlResult = await detectAnomalyML(event);
  score += mlResult.anomaly_score * weights.ml_based;
  
  return Math.min(score * 100, 100);  // 0-100 scale
}
```

---

## 7. Data Processing & Enrichment

### 7.1 Enrichment Pipeline

**Enrichment Sources:**

```typescript
interface EnrichmentData {
  // Geolocation enrichment
  geo: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp: string;
  };
  
  // Threat intelligence enrichment
  threat_intel: {
    ip_reputation: 'clean' | 'suspicious' | 'malicious';
    known_malware_ips: boolean;
    botnet_participation: boolean;
    threat_categories: string[];
  };
  
  // User context enrichment
  user_context: {
    department: string;
    manager: string;
    risk_score: number;
    data_classification_level: string;
    privileged_access: boolean;
  };
  
  // Asset context enrichment
  asset_context: {
    hostname: string;
    asset_owner: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    compliance_scope: string[];
    patch_level: string;
  };
}

async function enrichEvent(event: SecurityEvent): Promise<EnrichedEvent> {
  const enriched = { ...event };
  
  // Geolocation enrichment
  if (event.source?.ip) {
    enriched.source.geo = await getGeoLocation(event.source.ip);
  }
  
  // Threat intel enrichment
  if (event.source?.ip) {
    enriched.threat_intel = await getThreatIntel(event.source.ip);
  }
  
  // User context enrichment
  if (event.user?.id) {
    enriched.user_context = await getUserContext(event.user.id);
  }
  
  // Asset context enrichment
  if (event.host?.name) {
    enriched.asset_context = await getAssetContext(event.host.name);
  }
  
  return enriched;
}
```

### 7.2 Data Quality Controls

**Quality Checks:**
```typescript
interface DataQualityCheck {
  check: string;
  required: boolean;
  action: 'drop' | 'flag' | 'default';
}

const QUALITY_CHECKS: DataQualityCheck[] = [
  {
    check: 'has_timestamp',
    required: true,
    action: 'drop',  // Drop events without timestamp
  },
  {
    check: 'timestamp_in_range',
    required: true,
    action: 'flag',  // Flag but don't drop future timestamps
  },
  {
    check: 'has_user_id',
    required: false,
    action: 'flag',  // Flag but allow anonymous events
  },
  {
    check: 'valid_ip_format',
    required: true,
    action: 'default',  // Use default value (0.0.0.0)
  },
];

function validateDataQuality(event: SecurityEvent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const check of QUALITY_CHECKS) {
    const result = runQualityCheck(check.check, event);
    
    if (!result.passed) {
      if (check.required && check.action === 'drop') {
        errors.push(`Failed required check: ${check.check}`);
      } else {
        warnings.push(`Failed optional check: ${check.check}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## 8. Storage & Retention

### 8.1 Storage Tiers

| Tier | Purpose | Storage | Query Speed | Retention | Cost |
|------|---------|---------|-------------|-----------|------|
| **Hot** | Real-time analytics, active incidents | PostgreSQL SSD | < 100ms | 7 days | High |
| **Warm** | Recent investigations, trending | PostgreSQL | < 1s | 90 days | Medium |
| **Cold** | Compliance, forensics | S3/Blob | < 10s | 2 years | Low |
| **Archive** | Long-term compliance | Glacier | Minutes-Hours | 7+ years | Very Low |

### 8.2 Retention Policy

**Automated Data Lifecycle:**
```sql
-- Move data from hot to warm tier (run daily)
CREATE OR REPLACE FUNCTION move_to_warm_tier()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_moved_count INTEGER;
BEGIN
  -- Archive events older than 7 days to partitioned table
  WITH moved AS (
    INSERT INTO security_events_warm
    SELECT * FROM security_events_hot
    WHERE created_at < NOW() - INTERVAL '7 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_moved_count FROM moved;
  
  -- Delete from hot tier
  DELETE FROM security_events_hot
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  RETURN v_moved_count;
END;
$$;

-- Move data from warm to cold tier (run weekly)
CREATE OR REPLACE FUNCTION move_to_cold_tier()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Export to S3 via pg_dump or COPY
  COPY (
    SELECT * FROM security_events_warm
    WHERE created_at < NOW() - INTERVAL '90 days'
  ) TO PROGRAM 'aws s3 cp - s3://security-logs-cold/';
  
  -- Delete from warm tier
  DELETE FROM security_events_warm
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RETURN 1;
END;
$$;
```

**Retention Schedule:**
```typescript
const RETENTION_POLICY = {
  security_events: {
    hot: '7 days',
    warm: '90 days',
    cold: '2 years',
    archive: '7 years',
  },
  auth_events: {
    hot: '30 days',
    warm: '1 year',
    cold: '2 years',
    archive: 'indefinite',  // Regulatory requirement
  },
  ai_operations_log: {
    hot: '90 days',
    warm: '1 year',
    cold: '2 years',
    archive: 'none',
  },
  user_behavior_baselines: {
    hot: '90 days',
    archive: 'none',
  },
};
```

---

## 9. Analytics Use Cases

### 9.1 Threat Hunting Queries

**Find Potential Lateral Movement:**
```sql
-- Detect lateral movement patterns
SELECT
  user_id,
  COUNT(DISTINCT host_name) as unique_hosts_accessed,
  array_agg(DISTINCT host_name) as hosts,
  MIN(created_at) as first_access,
  MAX(created_at) as last_access
FROM security_events
WHERE event_category = 'authentication'
  AND event_outcome = 'success'
  AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(DISTINCT host_name) >= 5
ORDER BY unique_hosts_accessed DESC;
```

**Find Data Exfiltration Attempts:**
```sql
-- Detect unusual data transfer volumes
SELECT
  user_id,
  SUM(bytes_transferred) / 1024 / 1024 / 1024 as gb_transferred,
  COUNT(*) as transfer_count,
  array_agg(DISTINCT destination_ip) as destinations
FROM network_events
WHERE event_action = 'data_transfer'
  AND direction = 'outbound'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING SUM(bytes_transferred) > (
  -- Compare to user's baseline
  SELECT typical_data_volume_bytes * 10
  FROM user_behavior_baseline
  WHERE user_id = network_events.user_id
);
```

### 9.2 Compliance Reporting

**ISO 27001 Audit Report:**
```sql
-- Generate authentication control effectiveness report
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) FILTER (WHERE event_outcome = 'success') as successful_logins,
  COUNT(*) FILTER (WHERE event_outcome = 'failure') as failed_logins,
  COUNT(*) FILTER (WHERE mfa_verified = true) as mfa_verified_logins,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(risk_score) as avg_risk_score
FROM auth_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

## 10. Implementation Guide

### 10.1 Phase 1: Foundation (Week 1-2)

**Tasks:**
- [ ] Deploy log collection agents (Fluentd/Vector)
- [ ] Configure Kafka/Supabase Realtime for message queue
- [ ] Create security_events table with partitioning
- [ ] Set up basic normalization pipeline
- [ ] Test end-to-end log flow

**Deliverables:**
- Logs flowing from 5+ sources into PostgreSQL
- < 10 second latency
- ECS-compliant schema

### 10.2 Phase 2: Enrichment (Week 3-4)

**Tasks:**
- [ ] Integrate IP geolocation service
- [ ] Connect threat intelligence feeds
- [ ] Build user context enrichment
- [ ] Implement data quality checks
- [ ] Create enrichment metrics dashboard

### 10.3 Phase 3: Analytics (Week 5-6)

**Tasks:**
- [ ] Calculate initial user baselines (30 days historical)
- [ ] Implement statistical anomaly detection
- [ ] Deploy rule-based anomaly detection
- [ ] Create threat hunting dashboards
- [ ] Set up automated baseline refresh

### 10.4 Phase 4: AI/ML (Week 7-8)

**Tasks:**
- [ ] Build feature extraction pipeline
- [ ] Train initial anomaly detection models
- [ ] Deploy real-time ML inference
- [ ] Integrate with AI agents (from Task 5)
- [ ] Tune model thresholds based on false positives

---

## Appendix: Sample Queries

**Top Failed Login Attempts:**
```sql
SELECT
  user_id,
  source_ip,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM auth_events
WHERE event_type = 'login_failed'
  AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id, source_ip
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC
LIMIT 10;
```

**Anomaly Detection Summary:**
```sql
SELECT
  event_category,
  COUNT(*) as anomaly_count,
  AVG(anomaly_score) as avg_score,
  MAX(anomaly_score) as max_score
FROM security_events
WHERE is_anomaly = true
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_category
ORDER BY anomaly_count DESC;
```

---

**Document Control:**
- **Author:** Security Operations Team
- **Technical Reviewer:** Data Engineering Team
- **Approved By:** CISO
- **Next Review:** March 1, 2026
- **Version:** 1.0 (2025-12-01)
