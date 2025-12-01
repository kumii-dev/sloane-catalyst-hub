# AI Agent Integration Technical Specification

**Document Version:** 1.0  
**Date:** December 1, 2025  
**Status:** Active  
**ISO/IEC 27001:2022 Alignment:** A.5.23, A.8.3, A.8.4, A.8.9, A.8.24

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [OpenAI Service Integration](#2-openai-service-integration)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [AI Agent Implementations](#4-ai-agent-implementations)
5. [Data Flows](#5-data-flows)
6. [Security Controls](#6-security-controls)
7. [Error Handling & Resilience](#7-error-handling--resilience)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [Cost Management](#9-cost-management)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Architecture Overview

### 1.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sloane Catalyst Hub                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  React App   │      │ Edge Functions│                    │
│  │              │─────▶│  (Supabase)  │                    │
│  └──────────────┘      └───────┬──────┘                    │
│                                 │                            │
│                                 │ HTTPS                      │
│                                 ▼                            │
│                        ┌────────────────┐                   │
│                        │  AI Gateway    │                   │
│                        │  (Middleware)  │                   │
│                        └────────┬───────┘                   │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
                                  │ HTTPS + API Key
                                  ▼
                         ┌────────────────┐
                         │   OpenAI API   │
                         │  api.openai.com│
                         └────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌───────────┐ ┌──────────┐ ┌──────────┐
            │  GPT-4o   │ │GPT-4 Turbo│ │Embeddings│
            └───────────┘ └──────────┘ └──────────┘
```

### 1.2 Component Responsibilities

**React Application:**
- User interface for SOC dashboards
- Display AI analysis results
- Collect analyst feedback
- No direct OpenAI API calls (security)

**Supabase Edge Functions:**
- Secure API gateway for AI requests
- Authentication validation
- Request/response logging
- Rate limiting and cost control
- PII redaction before sending to OpenAI

**AI Gateway (Middleware):**
- Centralized OpenAI integration layer
- API key management
- Request queuing and retry logic
- Response caching
- Cost tracking per agent/user

**OpenAI API:**
- GPT-4o: Fast, cost-effective for most tasks
- GPT-4 Turbo: Complex reasoning, threat hunting
- text-embedding-3-small: Vector embeddings for similarity search

---

## 2. OpenAI Service Integration

### 2.1 API Configuration

**Base Configuration:**
```typescript
// supabase/functions/_shared/openai-config.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  organization: Deno.env.get('OPENAI_ORG_ID'),
  maxRetries: 3,
  timeout: 60000, // 60 seconds
});

export const AI_MODELS = {
  FAST: 'gpt-4o-2024-11-20', // Detection, Triage, Response
  ADVANCED: 'gpt-4-turbo-2024-04-09', // Investigation, Threat Hunting
  EMBEDDING: 'text-embedding-3-small', // Similarity search
} as const;

export const MODEL_LIMITS = {
  [AI_MODELS.FAST]: {
    maxTokens: 16384,
    temperature: 0.3,
    costPerM: { input: 2.50, output: 10.00 }, // USD per 1M tokens
  },
  [AI_MODELS.ADVANCED]: {
    maxTokens: 128000,
    temperature: 0.2,
    costPerM: { input: 10.00, output: 30.00 },
  },
  [AI_MODELS.EMBEDDING]: {
    dimensions: 1536,
    costPerM: { input: 0.02, output: 0 },
  },
};
```

### 2.2 Model Selection Strategy

| Use Case | Model | Reasoning |
|----------|-------|-----------|
| **Alert Detection** | GPT-4o | Fast (avg 800ms), cost-effective, sufficient accuracy |
| **Alert Triage** | GPT-4o | High throughput needed, straightforward classification |
| **Investigation** | GPT-4 Turbo | Complex reasoning, large context (128K tokens) |
| **Threat Hunting** | GPT-4 Turbo | Advanced pattern recognition, strategic thinking |
| **Response Execution** | GPT-4o | Speed critical for containment |
| **Report Generation** | GPT-4o | Structured output, formatting |
| **Similarity Search** | Embeddings | Vector search for related incidents/threats |

---

## 3. Authentication & Authorization

### 3.1 API Key Management

**Storage: Supabase Secrets**
```bash
# Set OpenAI API key (production)
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Set OpenAI Organization ID
supabase secrets set OPENAI_ORG_ID=org-...

# Verify secrets
supabase secrets list
```

**Rotation Policy:**
- Rotate API keys every 90 days
- Use separate keys for dev/staging/production
- Monitor key usage via OpenAI dashboard
- Revoke compromised keys immediately

### 3.2 Request Authentication Flow

```typescript
// supabase/functions/ai-detection/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  // 1. Validate Supabase JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // 2. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Invalid token', { status: 401 });
  }

  // 3. Check admin role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (!roles?.some(r => r.role === 'admin')) {
    return new Response('Forbidden', { status: 403 });
  }

  // 4. Process AI request
  const body = await req.json();
  const result = await processAIRequest(body, user.id);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 3.3 Rate Limiting

**Per-User Limits:**
```typescript
// supabase/functions/_shared/rate-limit.ts
const RATE_LIMITS = {
  ai_requests_per_hour: 100,
  ai_requests_per_day: 500,
  ai_tokens_per_day: 1000000, // 1M tokens
};

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('ai_operations_log')
    .select('request_tokens, response_tokens')
    .eq('user_id', userId)
    .gte('created_at', hourAgo.toISOString());

  if (error) throw error;

  const requestCount = data.length;
  const totalTokens = data.reduce(
    (sum, log) => sum + (log.request_tokens || 0) + (log.response_tokens || 0),
    0
  );

  return {
    allowed: requestCount < RATE_LIMITS.ai_requests_per_hour,
    remaining: RATE_LIMITS.ai_requests_per_hour - requestCount,
  };
}
```

---

## 4. AI Agent Implementations

### 4.1 Detection Agent

**Endpoint:** `POST /functions/v1/ai-detection`

**Request:**
```typescript
interface DetectionRequest {
  event: {
    domain: 'endpoint' | 'cloud' | 'identity' | 'application' | 'saas' | 'data';
    event_type: string;
    timestamp: string;
    user_id?: string;
    source_ip?: string;
    details: Record<string, any>;
  };
  context?: {
    user_baseline?: Record<string, any>;
    recent_events?: Array<any>;
  };
}
```

**Implementation:**
```typescript
// supabase/functions/ai-detection/index.ts
import { openai, AI_MODELS } from '../_shared/openai-config.ts';

async function detectThreat(request: DetectionRequest): Promise<DetectionResponse> {
  const systemPrompt = `You are a cybersecurity AI agent for threat detection.
Analyze security events and determine if they represent a threat.

Your response must be a valid JSON object with this structure:
{
  "is_threat": boolean,
  "confidence": number (0.0-1.0),
  "risk_score": number (0-100),
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "threat_category": string,
  "mitre_techniques": string[],
  "reasoning": string[],
  "evidence": object,
  "recommended_actions": string[]
}`;

  const userPrompt = `Analyze this security event:

Domain: ${request.event.domain}
Event Type: ${request.event.event_type}
Timestamp: ${request.event.timestamp}
User ID: ${request.event.user_id || 'N/A'}
Source IP: ${request.event.source_ip || 'N/A'}
Details: ${JSON.stringify(request.event.details, null, 2)}

${request.context?.user_baseline ? `User Baseline: ${JSON.stringify(request.context.user_baseline, null, 2)}` : ''}

Is this a security threat? Provide detailed analysis.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.FAST,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');

  // Log operation
  await logAIOperation({
    agent_type: 'detection',
    model: AI_MODELS.FAST,
    request_tokens: completion.usage?.prompt_tokens || 0,
    response_tokens: completion.usage?.completion_tokens || 0,
    confidence: result.confidence,
    result_summary: `Threat: ${result.is_threat}, Severity: ${result.severity}`,
  });

  return result;
}
```

**Response:**
```typescript
interface DetectionResponse {
  detection_id: string;
  is_threat: boolean;
  confidence: number; // 0.0-1.0
  risk_score: number; // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  threat_category: string;
  mitre_techniques: string[];
  reasoning: string[];
  evidence: Record<string, any>;
  recommended_actions: string[];
}
```

### 4.2 Triage Agent

**Endpoint:** `POST /functions/v1/ai-triage`

**Implementation:**
```typescript
async function triageAlert(alerts: Alert[]): Promise<TriageResponse> {
  const systemPrompt = `You are a SOC triage AI agent.
Prioritize security alerts based on risk, impact, and urgency.

Calculate priority score = (severity * confidence * asset_value) / 100
Route alerts to appropriate analyst tier:
- Auto-resolve: confidence < 30%
- L1 Analyst: Low-medium risk, standard patterns
- L2 Analyst: High risk, complex investigations
- L3/IR Lead: Critical risk, APT, ransomware, breach

Return JSON array of triage decisions.`;

  const userPrompt = `Triage these ${alerts.length} alerts:

${alerts.map((alert, i) => `
Alert ${i + 1}:
- ID: ${alert.alert_id}
- Severity: ${alert.severity}
- Confidence: ${alert.confidence}
- Affected Asset: ${alert.affected_asset}
- Summary: ${alert.summary}
`).join('\n')}

Prioritize and route each alert.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.FAST,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

### 4.3 Investigation Agent

**Endpoint:** `POST /functions/v1/ai-investigation`

**Implementation:**
```typescript
async function investigateIncident(incident: Incident): Promise<InvestigationResponse> {
  const systemPrompt = `You are a cybersecurity investigation AI agent.
Analyze incidents, reconstruct attack timelines, and identify root causes.

Your investigation should:
1. Build chronological timeline of events
2. Identify attacker TTPs (MITRE ATT&CK)
3. Map attack chain stages
4. Assess impact and scope
5. Recommend containment actions

Return detailed investigation report in JSON format.`;

  const userPrompt = `Investigate this security incident:

Incident ID: ${incident.incident_id}
Severity: ${incident.severity}
Initial Alert: ${incident.initial_alert}
Affected Systems: ${incident.affected_systems.join(', ')}
Affected Users: ${incident.affected_users.join(', ')}

Evidence:
${JSON.stringify(incident.evidence, null, 2)}

Conduct thorough investigation and provide report.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.ADVANCED, // Use GPT-4 Turbo for complex reasoning
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

### 4.4 Response Agent

**Endpoint:** `POST /functions/v1/ai-response`

**Implementation:**
```typescript
async function generateResponse(incident: Incident): Promise<ResponsePlaybook> {
  const systemPrompt = `You are a security response AI agent.
Generate containment and remediation playbooks for security incidents.

Response actions must be:
- Specific and actionable
- Prioritized by urgency
- Risk-assessed (business impact)
- Reversible when possible

Return response playbook in JSON format with steps, risks, and rollback procedures.`;

  const userPrompt = `Generate response playbook for:

Incident: ${incident.title}
Severity: ${incident.severity}
Attack Type: ${incident.attack_type}
Affected Assets: ${incident.affected_systems.join(', ')}
Business Impact: ${incident.business_impact}

Provide step-by-step containment and remediation plan.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.FAST,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

### 4.5 Reporting Agent

**Endpoint:** `POST /functions/v1/ai-report`

**Implementation:**
```typescript
async function generateIncidentReport(incident: Incident): Promise<IncidentReport> {
  const systemPrompt = `You are a security reporting AI agent.
Generate comprehensive incident reports for stakeholders.

Report structure:
1. Executive Summary (2-3 sentences, business impact focus)
2. Incident Timeline (chronological events)
3. Technical Details (attack vectors, TTPs)
4. Impact Assessment (systems, data, users affected)
5. Response Actions (what was done)
6. Lessons Learned (root causes, improvements)
7. Recommendations (preventive measures)

Format for ISO 27001 compliance and executive readability.`;

  const userPrompt = `Generate incident report for:

${JSON.stringify(incident, null, 2)}

Include all required sections with clear, concise language.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.FAST,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4, // Slightly higher for better writing quality
    max_tokens: 3000,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}
```

---

## 5. Data Flows

### 5.1 Detection Flow

```
Security Event → Edge Function → PII Redaction → OpenAI API → Response → Database Log → User Interface
     (XDR)       (ai-detection)   (sanitize)      (GPT-4o)    (parsed)   (ai_operations_log)  (Dashboard)
```

**Data Transformation:**
```typescript
// Input: Raw security event
const rawEvent = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'alice@example.com',
  source_ip: '203.0.113.50',
  details: { login_attempt: 'failed', password_entered: 'P@ssw0rd123' }
};

// After PII redaction
const sanitizedEvent = {
  user_id: '[REDACTED-UUID]',
  email: '[REDACTED-EMAIL]',
  source_ip: '203.0.113.50', // IP preserved for threat analysis
  details: { login_attempt: 'failed', password_entered: '[REDACTED-PASSWORD]' }
};

// Sent to OpenAI
// Received from OpenAI: Detection analysis
// Stored in database with original user_id for correlation
```

### 5.2 Investigation Flow

```
Incident Created → Gather Evidence → Build Context → AI Analysis → Present Results
   (Analyst)      (XDR Query)      (Correlate)     (GPT-4 Turbo)  (Dashboard)
                                                          ↓
                                                    Update Incident
                                                      (Database)
```

### 5.3 Response Flow

```
Incident Escalated → AI Generates Playbook → Human Approval → Execute Actions → Monitor
   (L2 Analyst)         (GPT-4o)             (IR Lead)        (Automation)    (Logging)
```

---

## 6. Security Controls

### 6.1 Data Protection

**PII Redaction:**
```typescript
// supabase/functions/_shared/pii-redaction.ts
export function redactPII(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const redacted = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    // Redact sensitive fields
    if (['password', 'token', 'api_key', 'secret'].some(s => key.toLowerCase().includes(s))) {
      (redacted as any)[key] = '[REDACTED-SECRET]';
    }
    // Redact email addresses
    else if (key === 'email' || (typeof value === 'string' && value.includes('@'))) {
      (redacted as any)[key] = '[REDACTED-EMAIL]';
    }
    // Redact phone numbers
    else if (key === 'phone' || (typeof value === 'string' && /\+?\d{10,}/.test(value))) {
      (redacted as any)[key] = '[REDACTED-PHONE]';
    }
    // Recursively process nested objects
    else if (typeof value === 'object' && value !== null) {
      (redacted as any)[key] = redactPII(value);
    }
    // Keep other data
    else {
      (redacted as any)[key] = value;
    }
  }

  return redacted;
}
```

**Data Minimization:**
- Only send data required for AI analysis
- Exclude irrelevant fields (UI state, metadata)
- Truncate large logs to relevant excerpts
- Aggregate when possible (counts vs full lists)

### 6.2 Network Security

**TLS Configuration:**
```typescript
// All OpenAI API calls use HTTPS (TLS 1.3)
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  // OpenAI SDK enforces HTTPS, no HTTP fallback
});
```

**Firewall Rules:**
```
# Allow outbound HTTPS to OpenAI API
Egress Rule:
- Destination: api.openai.com (443/tcp)
- Source: Supabase Edge Functions IP range
- Protocol: HTTPS (TLS 1.3)
- Action: ALLOW
- Logging: Enabled

# Block all other outbound from Edge Functions
Egress Rule (Default Deny):
- Destination: * (all)
- Source: Supabase Edge Functions
- Action: DENY
- Logging: Enabled
```

### 6.3 Input Validation

**Request Validation:**
```typescript
// supabase/functions/_shared/validation.ts
import { z } from 'zod';

export const DetectionRequestSchema = z.object({
  event: z.object({
    domain: z.enum(['endpoint', 'cloud', 'identity', 'application', 'saas', 'data']),
    event_type: z.string().min(1).max(100),
    timestamp: z.string().datetime(),
    user_id: z.string().uuid().optional(),
    source_ip: z.string().ip().optional(),
    details: z.record(z.any()),
  }),
  context: z.object({
    user_baseline: z.record(z.any()).optional(),
    recent_events: z.array(z.any()).optional(),
  }).optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
```

**Output Sanitization:**
```typescript
// Prevent prompt injection in AI responses
export function sanitizeAIResponse(response: string): string {
  // Remove potential injection attempts
  return response
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
```

### 6.4 Audit Logging

**Database Schema:**
```sql
CREATE TABLE ai_operations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    agent_type TEXT NOT NULL, -- 'detection', 'triage', 'investigation', 'response', 'reporting'
    model TEXT NOT NULL, -- 'gpt-4o', 'gpt-4-turbo'
    request_summary TEXT,
    response_summary TEXT,
    request_tokens INTEGER,
    response_tokens INTEGER,
    total_cost DECIMAL(10, 4), -- USD
    confidence DECIMAL(3, 2), -- AI confidence score
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_operations_user ON ai_operations_log(user_id);
CREATE INDEX idx_ai_operations_created ON ai_operations_log(created_at DESC);
CREATE INDEX idx_ai_operations_agent ON ai_operations_log(agent_type);
```

**Logging Function:**
```typescript
async function logAIOperation(log: Partial<AIOperationLog>): Promise<void> {
  const { data, error } = await supabase
    .from('ai_operations_log')
    .insert({
      user_id: log.user_id,
      agent_type: log.agent_type,
      model: log.model,
      request_summary: log.request_summary,
      response_summary: log.response_summary,
      request_tokens: log.request_tokens,
      response_tokens: log.response_tokens,
      total_cost: calculateCost(log.model, log.request_tokens, log.response_tokens),
      confidence: log.confidence,
      success: log.success,
      error_message: log.error_message,
      latency_ms: log.latency_ms,
    });

  if (error) {
    console.error('Failed to log AI operation:', error);
    // Don't fail request if logging fails
  }
}
```

---

## 7. Error Handling & Resilience

### 7.1 Retry Strategy

**Exponential Backoff:**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Check if error is retryable
      if (error instanceof OpenAI.APIError) {
        if (error.status && [429, 500, 502, 503, 504].includes(error.status)) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Non-retryable error, throw immediately
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 7.2 Timeout Handling

**Request Timeouts:**
```typescript
async function callOpenAIWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 60000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI request timeout')), timeoutMs)
  );

  return Promise.race([fn(), timeoutPromise]);
}
```

### 7.3 Fallback Mechanisms

**Degraded Mode:**
```typescript
async function detectThreatWithFallback(request: DetectionRequest): Promise<DetectionResponse> {
  try {
    // Primary: AI-powered detection
    return await detectThreatWithAI(request);
  } catch (error) {
    console.error('AI detection failed, falling back to rule-based:', error);

    // Fallback: Rule-based detection
    return detectThreatWithRules(request);
  }
}

function detectThreatWithRules(request: DetectionRequest): DetectionResponse {
  // Simple rule-based detection as fallback
  const rules = [
    { pattern: /failed.*login.*5.*times/, severity: 'high', category: 'Brute Force' },
    { pattern: /impossible.*travel/, severity: 'critical', category: 'Account Takeover' },
    // ... more rules
  ];

  for (const rule of rules) {
    if (rule.pattern.test(JSON.stringify(request))) {
      return {
        detection_id: crypto.randomUUID(),
        is_threat: true,
        confidence: 0.8, // Lower confidence for rule-based
        risk_score: rule.severity === 'critical' ? 90 : 70,
        severity: rule.severity,
        threat_category: rule.category,
        mitre_techniques: [],
        reasoning: ['Detected by rule-based fallback system'],
        evidence: {},
        recommended_actions: ['Investigate manually'],
      };
    }
  }

  return {
    detection_id: crypto.randomUUID(),
    is_threat: false,
    confidence: 0.5,
    risk_score: 0,
    severity: 'info',
    threat_category: 'Unknown',
    mitre_techniques: [],
    reasoning: ['No rules matched'],
    evidence: {},
    recommended_actions: [],
  };
}
```

### 7.4 Circuit Breaker

**Implementation:**
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures = 5,
    private resetTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.maxFailures) {
      this.state = 'open';
    }
  }
}

export const openAICircuitBreaker = new CircuitBreaker(5, 60000);
```

---

## 8. Monitoring & Observability

### 8.1 Metrics Collection

**Key Metrics:**
```typescript
interface AIMetrics {
  // Performance
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;

  // Reliability
  success_rate: number;
  error_rate: number;
  timeout_rate: number;

  // Usage
  requests_per_hour: number;
  tokens_per_hour: number;
  cost_per_hour: number;

  // Quality
  avg_confidence: number;
  false_positive_rate: number;
  false_negative_rate: number;
}
```

**Dashboard Query:**
```sql
-- AI Agent Performance Dashboard
SELECT
  agent_type,
  COUNT(*) as total_requests,
  AVG(latency_ms) as avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate,
  AVG(confidence) as avg_confidence,
  SUM(request_tokens + response_tokens) as total_tokens,
  SUM(total_cost) as total_cost
FROM ai_operations_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY agent_type;
```

### 8.2 Alerting

**Alert Rules:**
```typescript
const ALERT_THRESHOLDS = {
  high_error_rate: 0.10, // > 10% errors
  high_latency: 5000, // > 5 seconds
  high_cost: 100, // > $100/hour
  low_confidence: 0.60, // < 60% avg confidence
};

async function checkAlertConditions(): Promise<void> {
  const metrics = await getAIMetrics();

  if (metrics.error_rate > ALERT_THRESHOLDS.high_error_rate) {
    await sendAlert({
      severity: 'high',
      title: 'High AI Error Rate',
      message: `AI agent error rate: ${(metrics.error_rate * 100).toFixed(1)}%`,
      channel: 'slack',
    });
  }

  if (metrics.p95_latency_ms > ALERT_THRESHOLDS.high_latency) {
    await sendAlert({
      severity: 'medium',
      title: 'High AI Latency',
      message: `P95 latency: ${metrics.p95_latency_ms}ms`,
      channel: 'slack',
    });
  }

  if (metrics.cost_per_hour > ALERT_THRESHOLDS.high_cost) {
    await sendAlert({
      severity: 'high',
      title: 'High AI Cost',
      message: `AI cost: $${metrics.cost_per_hour.toFixed(2)}/hour`,
      channel: 'pagerduty',
    });
  }
}
```

### 8.3 Logging

**Structured Logging:**
```typescript
function logAIRequest(context: {
  agent: string;
  model: string;
  user_id: string;
  request_id: string;
  tokens: { input: number; output: number };
  latency: number;
  success: boolean;
  error?: string;
}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: context.success ? 'info' : 'error',
    service: 'ai-gateway',
    agent: context.agent,
    model: context.model,
    user_id: context.user_id,
    request_id: context.request_id,
    tokens_input: context.tokens.input,
    tokens_output: context.tokens.output,
    latency_ms: context.latency,
    success: context.success,
    error: context.error,
  }));
}
```

---

## 9. Cost Management

### 9.1 Cost Calculation

**Per-Request Cost:**
```typescript
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const limits = MODEL_LIMITS[model];
  if (!limits) return 0;

  const inputCost = (inputTokens / 1000000) * limits.costPerM.input;
  const outputCost = (outputTokens / 1000000) * limits.costPerM.output;

  return inputCost + outputCost;
}

// Example:
// GPT-4o: 1000 input + 500 output tokens
// Cost = (1000/1M * $2.50) + (500/1M * $10.00) = $0.0025 + $0.0050 = $0.0075
```

### 9.2 Budget Controls

**Monthly Budget:**
```typescript
const MONTHLY_BUDGET = {
  total: 1000, // $1,000/month
  per_user: 50, // $50/user/month
  alerts: {
    warning: 0.80, // 80% of budget
    critical: 0.95, // 95% of budget
  },
};

async function checkBudget(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('ai_operations_log')
    .select('total_cost')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString());

  const spent = data?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;

  if (spent >= MONTHLY_BUDGET.per_user) {
    return {
      allowed: false,
      reason: `Monthly budget exceeded: $${spent.toFixed(2)} / $${MONTHLY_BUDGET.per_user}`,
    };
  }

  return { allowed: true };
}
```

### 9.3 Cost Optimization

**Token Management:**
```typescript
function optimizePrompt(prompt: string, maxTokens: number): string {
  // Estimate tokens (rough: 1 token ≈ 4 characters)
  const estimatedTokens = prompt.length / 4;

  if (estimatedTokens <= maxTokens) {
    return prompt;
  }

  // Truncate to fit within token limit
  const targetLength = maxTokens * 4;
  const truncated = prompt.substring(0, targetLength);

  return truncated + '\n\n[Content truncated to fit token limit]';
}
```

**Response Caching:**
```typescript
// Cache identical requests for 5 minutes
const cache = new Map<string, { response: any; expiry: number }>();

async function callOpenAIWithCache(request: any): Promise<any> {
  const cacheKey = JSON.stringify(request);
  const cached = cache.get(cacheKey);

  if (cached && cached.expiry > Date.now()) {
    return cached.response;
  }

  const response = await callOpenAI(request);

  cache.set(cacheKey, {
    response,
    expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  return response;
}
```

---

## 10. Implementation Guide

### 10.1 Environment Setup

**Prerequisites:**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Install Deno (for Edge Functions)
brew install deno

# Login to Supabase
supabase login
```

**Configure Secrets:**
```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Set OpenAI Organization ID
supabase secrets set OPENAI_ORG_ID=org-...

# Verify
supabase secrets list
```

### 10.2 Deploy Edge Functions

**Directory Structure:**
```
supabase/functions/
├── _shared/
│   ├── openai-config.ts
│   ├── pii-redaction.ts
│   ├── rate-limit.ts
│   └── validation.ts
├── ai-detection/
│   └── index.ts
├── ai-triage/
│   └── index.ts
├── ai-investigation/
│   └── index.ts
├── ai-response/
│   └── index.ts
└── ai-report/
    └── index.ts
```

**Deploy:**
```bash
# Deploy all functions
supabase functions deploy --project-ref zdenlybzgnphsrsvtufj

# Deploy specific function
supabase functions deploy ai-detection --project-ref zdenlybzgnphsrsvtufj

# Check deployment status
supabase functions list
```

### 10.3 Database Setup

**Create Tables:**
```sql
-- AI operations log
CREATE TABLE ai_operations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    agent_type TEXT NOT NULL,
    model TEXT NOT NULL,
    request_summary TEXT,
    response_summary TEXT,
    request_tokens INTEGER,
    response_tokens INTEGER,
    total_cost DECIMAL(10, 4),
    confidence DECIMAL(3, 2),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_operations_user ON ai_operations_log(user_id);
CREATE INDEX idx_ai_operations_created ON ai_operations_log(created_at DESC);
CREATE INDEX idx_ai_operations_agent ON ai_operations_log(agent_type);

-- Enable RLS
ALTER TABLE ai_operations_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own logs
CREATE POLICY "Users can view own AI operations"
ON ai_operations_log FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all AI operations"
ON ai_operations_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 10.4 Frontend Integration

**API Client:**
```typescript
// src/lib/ai-client.ts
import { supabase } from './supabase';

export class AIClient {
  async detectThreat(event: SecurityEvent): Promise<DetectionResponse> {
    const { data, error } = await supabase.functions.invoke('ai-detection', {
      body: { event },
    });

    if (error) throw error;
    return data;
  }

  async triageAlerts(alerts: Alert[]): Promise<TriageResponse> {
    const { data, error } = await supabase.functions.invoke('ai-triage', {
      body: { alerts },
    });

    if (error) throw error;
    return data;
  }

  async investigateIncident(incident: Incident): Promise<InvestigationResponse> {
    const { data, error } = await supabase.functions.invoke('ai-investigation', {
      body: { incident },
    });

    if (error) throw error;
    return data;
  }
}

export const aiClient = new AIClient();
```

**React Hook:**
```typescript
// src/hooks/useAIDetection.ts
import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';

export function useAIDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function detect(event: SecurityEvent) {
    setLoading(true);
    setError(null);

    try {
      const result = await aiClient.detectThreat(event);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { detect, loading, error };
}
```

### 10.5 Testing

**Unit Tests:**
```typescript
// supabase/functions/ai-detection/index.test.ts
import { assertEquals } from 'https://deno.land/std@0.220.0/assert/mod.ts';
import { detectThreat } from './index.ts';

Deno.test('Detection Agent - Brute Force Attack', async () => {
  const request = {
    event: {
      domain: 'identity',
      event_type: 'login_failure',
      timestamp: new Date().toISOString(),
      user_id: 'test-user-id',
      source_ip: '203.0.113.50',
      details: { failed_attempts: 10 },
    },
  };

  const result = await detectThreat(request);

  assertEquals(result.is_threat, true);
  assertEquals(result.severity, 'high');
  assert(result.confidence > 0.8);
});
```

**Integration Tests:**
```bash
# Test Edge Function locally
supabase functions serve ai-detection

# Send test request
curl -X POST http://localhost:54321/functions/v1/ai-detection \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event": {...}}'
```

---

## Appendix A: API Endpoints Reference

| Agent | Endpoint | Method | Auth Required |
|-------|----------|--------|---------------|
| Detection | `/functions/v1/ai-detection` | POST | Yes (Admin) |
| Triage | `/functions/v1/ai-triage` | POST | Yes (Admin) |
| Investigation | `/functions/v1/ai-investigation` | POST | Yes (Admin) |
| Response | `/functions/v1/ai-response` | POST | Yes (Admin) |
| Reporting | `/functions/v1/ai-report` | POST | Yes (Admin) |

---

## Appendix B: Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `AI_001` | OpenAI API key invalid | Rotate API key in Supabase secrets |
| `AI_002` | Rate limit exceeded | Wait or upgrade OpenAI plan |
| `AI_003` | Request timeout | Reduce input size or increase timeout |
| `AI_004` | Invalid input format | Validate request against schema |
| `AI_005` | Budget exceeded | Review cost controls or increase budget |
| `AI_006` | Model unavailable | Switch to fallback model |
| `AI_007` | PII detected in response | Report to security team |

---

## Appendix C: Cost Estimates

**Monthly Cost Projection:**

| Scenario | Requests/Day | Avg Tokens/Request | Model | Monthly Cost |
|----------|--------------|-------------------|-------|--------------|
| **Light** | 100 | 2,000 | GPT-4o | $15 |
| **Medium** | 500 | 3,000 | GPT-4o | $112 |
| **Heavy** | 1,000 | 4,000 | GPT-4o + GPT-4 Turbo | $450 |
| **Enterprise** | 5,000 | 5,000 | GPT-4o + GPT-4 Turbo | $2,250 |

**Cost per Agent Type (avg):**
- Detection Agent: $0.015 per alert
- Triage Agent: $0.010 per batch (10 alerts)
- Investigation Agent: $0.080 per incident (GPT-4 Turbo)
- Response Agent: $0.020 per playbook
- Reporting Agent: $0.025 per report

---

**Document Control:**
- **Author:** Security Operations Team
- **Technical Reviewer:** AI Engineering Team
- **Approved By:** CISO
- **Next Review:** March 1, 2026 (Quarterly)
- **Version History:**
  - v1.0 (2025-12-01): Initial release
