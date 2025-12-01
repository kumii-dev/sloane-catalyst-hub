# Identity & Authentication Security Controls

**Document Version:** 1.0  
**Date:** December 1, 2025  
**Status:** Active  
**ISO/IEC 27001:2022 Alignment:** A.5.15, A.5.16, A.5.17, A.5.18, A.8.5

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Authentication Architecture](#2-authentication-architecture)
3. [Continuous Conditional Access](#3-continuous-conditional-access)
4. [Token Replay Detection](#4-token-replay-detection)
5. [Session Fixation Prevention](#5-session-fixation-prevention)
6. [Machine Identity Security](#6-machine-identity-security)
7. [Multi-Factor Authentication (MFA)](#7-multi-factor-authentication-mfa)
8. [Password Security](#8-password-security)
9. [Session Management](#9-session-management)
10. [Audit & Compliance](#10-audit--compliance)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines comprehensive identity and authentication security controls for Sloane Catalyst Hub, aligned with ISO/IEC 27001:2022 requirements. These controls protect against common authentication attacks including credential stuffing, token replay, session hijacking, and unauthorized access.

### 1.2 Scope

**In Scope:**
- User authentication (email/password, OAuth, MFA)
- Session management and lifecycle
- Token generation, validation, and revocation
- Continuous access evaluation
- Machine-to-machine authentication
- Audit logging for authentication events

**Out of Scope:**
- Authorization/RBAC policies (separate document)
- Network-level security controls
- Physical access controls

### 1.3 Key Security Controls

| Control ID | Description | Risk Mitigated | Implementation Status |
|------------|-------------|----------------|----------------------|
| **IAM-001** | Continuous Conditional Access | Privilege escalation, compromised sessions | ✅ Implemented |
| **IAM-002** | Token Replay Detection | Token theft, replay attacks | ✅ Implemented |
| **IAM-003** | Session Fixation Prevention | Session hijacking | ✅ Implemented |
| **IAM-004** | Machine Identity Security | API key theft, service impersonation | ✅ Implemented |
| **IAM-005** | Multi-Factor Authentication | Credential theft, brute force | ✅ Implemented |
| **IAM-006** | Password Security | Weak passwords, credential reuse | ✅ Implemented |
| **IAM-007** | Session Timeout & Rotation | Abandoned sessions, long-lived tokens | ✅ Implemented |

---

## 2. Authentication Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│                     (React + Supabase Client)                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 1. Login Request
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Auth Service                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Email/Password│  │  Google OAuth │  │     MFA      │         │
│  │  Provider    │  │   Provider    │  │   Provider   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 2. Issue JWT Token
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Security Middleware                           │
│                   (Edge Functions / Backend)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Continuous Conditional Access Engine             │  │
│  │  • Token validation                                        │  │
│  │  • Contextual risk assessment                              │  │
│  │  • Real-time policy evaluation                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Token Replay Detection                        │  │
│  │  • Token fingerprinting                                    │  │
│  │  • Usage pattern analysis                                  │  │
│  │  • Anomaly detection                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Session Fixation Prevention                     │  │
│  │  • Session ID regeneration                                 │  │
│  │  • Secure cookie attributes                                │  │
│  │  • CSRF token validation                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 3. Authorized Request
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Backend                         │
│                  (Supabase Database + APIs)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Authentication Flow

**Standard Login Flow:**
```
1. User submits credentials → Email + Password
2. Supabase Auth validates credentials
3. Generate JWT access token (1 hour) + refresh token (30 days)
4. Return tokens to client
5. Client stores tokens in secure storage (httpOnly cookies preferred)
6. Subsequent requests include access token in Authorization header
7. Middleware validates token and checks conditional access policies
8. Request proceeds if all checks pass
```

**OAuth2 Flow (Google):**
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User authorizes application
4. Google redirects back with authorization code
5. Exchange code for Google access token
6. Supabase creates/updates user account
7. Issue Supabase JWT tokens
8. Client stores tokens
```

---

## 3. Continuous Conditional Access

### 3.1 Overview

Continuous Conditional Access (CCA) evaluates authentication context on **every request**, not just at login. This prevents privilege escalation and detects compromised sessions in real-time.

### 3.2 Risk Factors

**Contextual Risk Assessment:**
```typescript
interface RiskContext {
  // Device & Network
  ip_address: string;
  user_agent: string;
  device_fingerprint: string;
  geolocation: { country: string; city: string };
  isp: string;
  is_vpn: boolean;
  is_tor: boolean;
  
  // Behavioral
  login_velocity: number; // Logins per hour
  impossible_travel: boolean; // Location changed too fast
  unusual_time: boolean; // Login outside normal hours
  new_device: boolean; // First time seeing this device
  
  // Threat Intelligence
  ip_reputation: 'clean' | 'suspicious' | 'malicious';
  credential_leak: boolean; // Password in known breaches
  
  // Session Context
  session_age: number; // Minutes since login
  privilege_level: string; // User role
  sensitive_action: boolean; // High-risk operation attempted
}
```

**Risk Scoring Algorithm:**
```typescript
function calculateRiskScore(context: RiskContext): number {
  let score = 0;
  
  // Network risk (0-30 points)
  if (context.is_tor) score += 30;
  else if (context.is_vpn) score += 15;
  if (context.ip_reputation === 'malicious') score += 30;
  else if (context.ip_reputation === 'suspicious') score += 20;
  
  // Behavioral risk (0-40 points)
  if (context.impossible_travel) score += 40;
  if (context.login_velocity > 5) score += 20;
  if (context.unusual_time) score += 10;
  if (context.new_device) score += 15;
  
  // Credential risk (0-30 points)
  if (context.credential_leak) score += 30;
  
  // Session risk (0-10 points)
  if (context.session_age > 480) score += 10; // > 8 hours
  
  return Math.min(score, 100); // Cap at 100
}
```

### 3.3 Access Policies

**Risk-Based Actions:**

| Risk Score | Action | Requirements |
|------------|--------|--------------|
| 0-20 (Low) | ✅ Allow | None |
| 21-40 (Medium) | ⚠️ Allow with logging | Enhanced audit logging |
| 41-60 (High) | 🔐 Challenge | Require MFA re-authentication |
| 61-80 (Very High) | 🚫 Block + Alert | Block access, notify security team |
| 81-100 (Critical) | 🔴 Terminate | Terminate session, force password reset |

**Policy Examples:**

```typescript
const CONDITIONAL_ACCESS_POLICIES = [
  {
    name: 'Admin from new device',
    condition: (ctx: RiskContext) => 
      ctx.privilege_level === 'admin' && ctx.new_device,
    action: 'require_mfa',
    reason: 'Admin access from unrecognized device requires MFA',
  },
  {
    name: 'Impossible travel detected',
    condition: (ctx: RiskContext) => ctx.impossible_travel,
    action: 'terminate_session',
    reason: 'User location changed impossibly fast (potential account takeover)',
  },
  {
    name: 'Malicious IP access',
    condition: (ctx: RiskContext) => ctx.ip_reputation === 'malicious',
    action: 'block',
    reason: 'Access from known malicious IP address',
  },
  {
    name: 'Leaked credential detected',
    condition: (ctx: RiskContext) => ctx.credential_leak,
    action: 'force_password_reset',
    reason: 'Password found in credential breach database',
  },
  {
    name: 'Sensitive action from Tor',
    condition: (ctx: RiskContext) => 
      ctx.is_tor && ctx.sensitive_action,
    action: 'block',
    reason: 'Sensitive operations blocked from Tor network',
  },
];
```

### 3.4 Implementation

**Database Schema:**
```sql
-- Store authentication context for analysis
CREATE TABLE auth_context_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    
    -- Request context
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    country_code VARCHAR(2),
    city TEXT,
    isp TEXT,
    is_vpn BOOLEAN DEFAULT false,
    is_tor BOOLEAN DEFAULT false,
    
    -- Risk assessment
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high', 'critical')),
    risk_factors JSONB, -- Array of triggered risk factors
    
    -- Policy decision
    policy_decision TEXT CHECK (policy_decision IN ('allow', 'challenge', 'block', 'terminate')),
    policy_reason TEXT,
    
    -- Behavioral signals
    is_new_device BOOLEAN DEFAULT false,
    is_impossible_travel BOOLEAN DEFAULT false,
    login_velocity INTEGER, -- Logins in past hour
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_context_user ON auth_context_log(user_id);
CREATE INDEX idx_auth_context_created ON auth_context_log(created_at DESC);
CREATE INDEX idx_auth_context_risk ON auth_context_log(risk_score DESC);
CREATE INDEX idx_auth_context_decision ON auth_context_log(policy_decision);
```

**Middleware Implementation:**
```typescript
// supabase/functions/_shared/conditional-access.ts
import { createClient } from '@supabase/supabase-js';

export async function evaluateConditionalAccess(
  userId: string,
  sessionId: string,
  request: Request
): Promise<{ allowed: boolean; action: string; reason?: string }> {
  
  // 1. Extract context from request
  const context = await extractRiskContext(userId, sessionId, request);
  
  // 2. Calculate risk score
  const riskScore = calculateRiskScore(context);
  const riskLevel = getRiskLevel(riskScore);
  
  // 3. Evaluate policies
  const policyDecision = await evaluatePolicies(context, riskScore);
  
  // 4. Log authentication context
  await logAuthContext({
    user_id: userId,
    session_id: sessionId,
    ip_address: context.ip_address,
    user_agent: context.user_agent,
    device_fingerprint: context.device_fingerprint,
    country_code: context.geolocation.country,
    city: context.geolocation.city,
    is_vpn: context.is_vpn,
    is_tor: context.is_tor,
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_factors: context.risk_factors,
    policy_decision: policyDecision.action,
    policy_reason: policyDecision.reason,
    is_new_device: context.new_device,
    is_impossible_travel: context.impossible_travel,
    login_velocity: context.login_velocity,
  });
  
  // 5. Take action based on decision
  switch (policyDecision.action) {
    case 'allow':
      return { allowed: true, action: 'allow' };
    
    case 'challenge':
      return {
        allowed: false,
        action: 'require_mfa',
        reason: policyDecision.reason,
      };
    
    case 'block':
      await sendSecurityAlert({
        severity: 'high',
        title: 'Access Blocked by Conditional Access',
        user_id: userId,
        reason: policyDecision.reason,
        context,
      });
      return {
        allowed: false,
        action: 'block',
        reason: policyDecision.reason,
      };
    
    case 'terminate':
      await terminateSession(userId, sessionId);
      await sendSecurityAlert({
        severity: 'critical',
        title: 'Session Terminated by Conditional Access',
        user_id: userId,
        reason: policyDecision.reason,
        context,
      });
      return {
        allowed: false,
        action: 'terminate',
        reason: policyDecision.reason,
      };
    
    default:
      return { allowed: true, action: 'allow' };
  }
}

async function extractRiskContext(
  userId: string,
  sessionId: string,
  request: Request
): Promise<RiskContext> {
  const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Get geolocation from IP
  const geo = await getGeoLocation(ip);
  
  // Check if IP is VPN/Tor
  const ipInfo = await getIPInfo(ip);
  
  // Get device fingerprint from custom header
  const deviceFingerprint = request.headers.get('x-device-fingerprint') || '';
  
  // Check for impossible travel
  const impossibleTravel = await detectImpossibleTravel(userId, geo);
  
  // Get login velocity
  const loginVelocity = await getLoginVelocity(userId);
  
  // Check if new device
  const isNewDevice = await isDeviceNew(userId, deviceFingerprint);
  
  // Check credential leaks
  const credentialLeak = await checkCredentialLeak(userId);
  
  // Get session age
  const sessionAge = await getSessionAge(sessionId);
  
  // Get user privilege level
  const privilegeLevel = await getUserRole(userId);
  
  return {
    ip_address: ip,
    user_agent: userAgent,
    device_fingerprint: deviceFingerprint,
    geolocation: geo,
    isp: ipInfo.isp,
    is_vpn: ipInfo.is_vpn,
    is_tor: ipInfo.is_tor,
    login_velocity: loginVelocity,
    impossible_travel: impossibleTravel,
    unusual_time: isUnusualTime(),
    new_device: isNewDevice,
    ip_reputation: ipInfo.reputation,
    credential_leak: credentialLeak,
    session_age: sessionAge,
    privilege_level: privilegeLevel,
    sensitive_action: isSensitiveAction(request),
  };
}

function getRiskLevel(score: number): string {
  if (score <= 20) return 'low';
  if (score <= 40) return 'medium';
  if (score <= 60) return 'high';
  if (score <= 80) return 'very_high';
  return 'critical';
}
```

---

## 4. Token Replay Detection

### 4.1 Overview

Token replay attacks occur when an attacker intercepts a valid JWT token and reuses it to impersonate the legitimate user. This control detects and blocks token reuse from different contexts.

### 4.2 Token Fingerprinting

**Token Metadata:**
```typescript
interface TokenFingerprint {
  token_id: string; // Unique token identifier (jti claim)
  user_id: string;
  issued_at: number; // Unix timestamp
  expires_at: number;
  
  // Binding context (captured at token issuance)
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  
  // Usage tracking
  first_used_at: number;
  last_used_at: number;
  use_count: number;
  unique_ips: string[]; // List of IPs that used this token
  unique_devices: string[]; // List of device fingerprints
}
```

**Token Generation:**
```typescript
async function issueToken(userId: string, request: Request): Promise<string> {
  const tokenId = crypto.randomUUID();
  const deviceFingerprint = extractDeviceFingerprint(request);
  const ipAddress = extractIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Store token fingerprint
  await storeTokenFingerprint({
    token_id: tokenId,
    user_id: userId,
    device_fingerprint: deviceFingerprint,
    ip_address: ipAddress,
    user_agent: userAgent,
    first_used_at: Date.now(),
  });
  
  // Generate JWT with jti claim
  const token = await generateJWT({
    sub: userId, // Subject (user ID)
    jti: tokenId, // JWT ID (unique token identifier)
    iat: Math.floor(Date.now() / 1000), // Issued at
    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
  });
  
  return token;
}
```

### 4.3 Replay Detection Logic

**Anomaly Detection:**
```typescript
async function detectTokenReplay(
  tokenId: string,
  currentRequest: Request
): Promise<{ is_replay: boolean; confidence: number; reason?: string }> {
  
  // Get stored token fingerprint
  const fingerprint = await getTokenFingerprint(tokenId);
  if (!fingerprint) {
    return { is_replay: true, confidence: 1.0, reason: 'Token not found' };
  }
  
  // Extract current context
  const currentDevice = extractDeviceFingerprint(currentRequest);
  const currentIP = extractIP(currentRequest);
  const currentUA = currentRequest.headers.get('user-agent') || '';
  
  let suspicionScore = 0;
  const reasons: string[] = [];
  
  // Check 1: Device fingerprint mismatch
  if (currentDevice !== fingerprint.device_fingerprint) {
    suspicionScore += 40;
    reasons.push('Device fingerprint changed');
  }
  
  // Check 2: IP address changed dramatically
  if (!isSameIPRange(currentIP, fingerprint.ip_address)) {
    suspicionScore += 30;
    reasons.push('IP address from different range');
  }
  
  // Check 3: User agent changed
  if (!isSimilarUserAgent(currentUA, fingerprint.user_agent)) {
    suspicionScore += 20;
    reasons.push('User agent changed');
  }
  
  // Check 4: Concurrent usage from different locations
  const recentUsage = await getRecentTokenUsage(tokenId, 60); // Last 60 seconds
  if (recentUsage.unique_ips.length > 1) {
    suspicionScore += 40;
    reasons.push('Token used from multiple IPs simultaneously');
  }
  
  // Check 5: Impossible travel between uses
  if (await detectImpossibleTravelForToken(tokenId, currentIP)) {
    suspicionScore += 50;
    reasons.push('Impossible travel detected');
  }
  
  // Update usage tracking
  await updateTokenUsage(tokenId, {
    last_used_at: Date.now(),
    use_count: fingerprint.use_count + 1,
    unique_ips: [...new Set([...fingerprint.unique_ips, currentIP])],
    unique_devices: [...new Set([...fingerprint.unique_devices, currentDevice])],
  });
  
  // Determine if replay attack
  const isReplay = suspicionScore >= 50;
  const confidence = Math.min(suspicionScore / 100, 1.0);
  
  if (isReplay) {
    // Log security event
    await logSecurityEvent({
      event_type: 'token_replay_detected',
      severity: 'high',
      token_id: tokenId,
      user_id: fingerprint.user_id,
      suspicion_score: suspicionScore,
      reasons: reasons,
      original_context: {
        device: fingerprint.device_fingerprint,
        ip: fingerprint.ip_address,
        ua: fingerprint.user_agent,
      },
      current_context: {
        device: currentDevice,
        ip: currentIP,
        ua: currentUA,
      },
    });
    
    return {
      is_replay: true,
      confidence: confidence,
      reason: reasons.join(', '),
    };
  }
  
  return { is_replay: false, confidence: 0 };
}
```

### 4.4 Database Schema

```sql
-- Store token fingerprints
CREATE TABLE token_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Binding context
    device_fingerprint TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Usage tracking
    first_used_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    use_count INTEGER DEFAULT 0,
    unique_ips TEXT[], -- Array of IPs
    unique_devices TEXT[], -- Array of device fingerprints
    
    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_fingerprints_token ON token_fingerprints(token_id);
CREATE INDEX idx_token_fingerprints_user ON token_fingerprints(user_id);
CREATE INDEX idx_token_fingerprints_revoked ON token_fingerprints(is_revoked);

-- Store token usage events
CREATE TABLE token_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Context
    ip_address INET NOT NULL,
    device_fingerprint TEXT,
    user_agent TEXT,
    endpoint TEXT, -- API endpoint called
    
    -- Replay detection
    is_suspicious BOOLEAN DEFAULT false,
    suspicion_score INTEGER,
    suspicion_reasons TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_usage_token ON token_usage_events(token_id);
CREATE INDEX idx_token_usage_created ON token_usage_events(created_at DESC);
CREATE INDEX idx_token_usage_suspicious ON token_usage_events(is_suspicious);
```

### 4.5 Mitigation Actions

**When Replay Detected:**
```typescript
async function handleTokenReplay(tokenId: string, userId: string): Promise<void> {
  // 1. Revoke the compromised token
  await revokeToken(tokenId, 'Token replay detected');
  
  // 2. Terminate all user sessions
  await terminateAllSessions(userId);
  
  // 3. Notify user
  await sendSecurityAlert({
    user_id: userId,
    channel: 'email',
    subject: 'Security Alert: Suspicious Activity Detected',
    message: 'We detected your account being accessed from an unusual location. All sessions have been terminated for your safety. Please log in again and review your account activity.',
  });
  
  // 4. Alert security team
  await sendSecurityAlert({
    severity: 'high',
    title: 'Token Replay Attack Detected',
    user_id: userId,
    token_id: tokenId,
    channel: 'slack',
  });
  
  // 5. Create security incident
  await createSecurityIncident({
    type: 'token_replay',
    severity: 'high',
    user_id: userId,
    token_id: tokenId,
    status: 'investigating',
  });
}
```

---

## 5. Session Fixation Prevention

### 5.1 Overview

Session fixation attacks occur when an attacker tricks a user into using a session ID controlled by the attacker. Prevention requires regenerating session IDs at authentication boundaries.

### 5.2 Prevention Mechanisms

**1. Session ID Regeneration:**
```typescript
async function authenticateUser(email: string, password: string): Promise<Session> {
  // Validate credentials
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error || !user) {
    throw new Error('Invalid credentials');
  }
  
  // CRITICAL: Regenerate session ID after successful authentication
  const newSessionId = crypto.randomUUID();
  
  // Invalidate any pre-existing session ID
  const oldSessionId = getCurrentSessionId();
  if (oldSessionId) {
    await invalidateSession(oldSessionId);
  }
  
  // Create new session with fresh ID
  const session = await createSession({
    session_id: newSessionId,
    user_id: user.user.id,
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
    expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
  });
  
  return session;
}
```

**2. Secure Cookie Configuration:**
```typescript
// Set session cookie with secure attributes
function setSessionCookie(sessionId: string, response: Response): void {
  const cookie = [
    `session_id=${sessionId}`,
    'HttpOnly', // Prevent JavaScript access
    'Secure', // HTTPS only
    'SameSite=Strict', // CSRF protection
    `Max-Age=${8 * 60 * 60}`, // 8 hours
    'Path=/',
  ].join('; ');
  
  response.headers.set('Set-Cookie', cookie);
}
```

**3. CSRF Token Generation:**
```typescript
async function generateCSRFToken(sessionId: string): Promise<string> {
  // Create unique CSRF token bound to session
  const csrfToken = crypto.randomUUID();
  
  // Store in database
  await storeCSRFToken({
    session_id: sessionId,
    csrf_token: csrfToken,
    expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
  });
  
  return csrfToken;
}

async function validateCSRFToken(
  sessionId: string,
  providedToken: string
): Promise<boolean> {
  const stored = await getCSRFToken(sessionId);
  
  if (!stored) return false;
  if (stored.expires_at < new Date()) return false;
  if (stored.csrf_token !== providedToken) return false;
  
  return true;
}
```

### 5.3 Database Schema

```sql
-- Store active sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session context
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    
    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    terminated_at TIMESTAMPTZ,
    termination_reason TEXT,
    
    -- Security
    mfa_verified BOOLEAN DEFAULT false,
    risk_level TEXT DEFAULT 'low'
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Store CSRF tokens
CREATE TABLE csrf_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    csrf_token UUID UNIQUE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    
    -- One-time use
    is_used BOOLEAN DEFAULT false
);

CREATE INDEX idx_csrf_tokens_session ON csrf_tokens(session_id);
CREATE INDEX idx_csrf_tokens_token ON csrf_tokens(csrf_token);
CREATE INDEX idx_csrf_tokens_expires ON csrf_tokens(expires_at);
```

### 5.4 Session Lifecycle

**Session Creation Flow:**
```
1. User provides credentials
2. Validate credentials
3. Invalidate any pre-existing session ID
4. Generate new session ID (UUID v4)
5. Create session record in database
6. Generate CSRF token
7. Set secure session cookie
8. Return session to client
```

**Session Validation Flow:**
```
1. Extract session ID from cookie
2. Query session from database
3. Check if session is active
4. Check if session has expired
5. Validate CSRF token (for state-changing operations)
6. Update last_activity_at timestamp
7. Evaluate conditional access policies
8. Allow or deny request
```

**Session Termination Flow:**
```
1. Mark session as inactive (is_active = false)
2. Set terminated_at timestamp
3. Record termination_reason
4. Clear session cookie
5. Revoke associated tokens
6. Log termination event
```

---

## 6. Machine Identity Security

### 6.1 Overview

Machine identities (API keys, service accounts, OAuth2 client credentials) require specialized security controls distinct from user authentication.

### 6.2 API Key Management

**API Key Structure:**
```
Format: sck_<environment>_<random_32_bytes>
Example: sck_live_7f3a9b2c1d8e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9

Components:
- sck: Sloane Catalyst Key prefix
- live/test: Environment identifier
- 32 bytes: Cryptographically random key material
```

**Key Generation:**
```typescript
async function generateAPIKey(
  userId: string,
  name: string,
  scopes: string[]
): Promise<{ key: string; key_id: string }> {
  
  // Generate cryptographically secure random key
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const keyMaterial = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const environment = Deno.env.get('ENVIRONMENT') || 'test';
  const apiKey = `sck_${environment}_${keyMaterial}`;
  
  // Hash key for storage (never store plaintext)
  const keyHash = await hashAPIKey(apiKey);
  const keyId = crypto.randomUUID();
  
  // Store key metadata
  await storeAPIKey({
    key_id: keyId,
    key_hash: keyHash,
    user_id: userId,
    name: name,
    scopes: scopes,
    prefix: apiKey.substring(0, 16), // Store prefix for identification
    last_used_at: null,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });
  
  // Return plaintext key ONLY once
  return { key: apiKey, key_id: keyId };
}

async function hashAPIKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**Key Validation:**
```typescript
async function validateAPIKey(providedKey: string): Promise<{
  valid: boolean;
  user_id?: string;
  scopes?: string[];
  key_id?: string;
}> {
  
  // Extract prefix
  const prefix = providedKey.substring(0, 16);
  
  // Hash provided key
  const keyHash = await hashAPIKey(providedKey);
  
  // Lookup key by hash
  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single();
  
  if (error || !apiKey) {
    return { valid: false };
  }
  
  // Check expiration
  if (new Date(apiKey.expires_at) < new Date()) {
    return { valid: false };
  }
  
  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ 
      last_used_at: new Date().toISOString(),
      use_count: apiKey.use_count + 1,
    })
    .eq('key_id', apiKey.key_id);
  
  return {
    valid: true,
    user_id: apiKey.user_id,
    scopes: apiKey.scopes,
    key_id: apiKey.key_id,
  };
}
```

### 6.3 Database Schema

```sql
-- Store API keys (hashed)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id UUID UNIQUE NOT NULL,
    key_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of key
    prefix TEXT NOT NULL, -- First 16 chars for identification
    
    -- Ownership
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Human-readable name
    description TEXT,
    
    -- Permissions
    scopes TEXT[] NOT NULL, -- Array of allowed scopes
    
    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    use_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- Store API key usage logs
CREATE TABLE api_key_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id UUID REFERENCES api_keys(key_id) ON DELETE CASCADE,
    
    -- Request context
    ip_address INET NOT NULL,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    
    -- Response
    status_code INTEGER,
    response_time_ms INTEGER,
    
    -- Anomaly detection
    is_suspicious BOOLEAN DEFAULT false,
    suspicion_reasons TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_key_usage_key ON api_key_usage(key_id);
CREATE INDEX idx_api_key_usage_created ON api_key_usage(created_at DESC);
CREATE INDEX idx_api_key_usage_suspicious ON api_key_usage(is_suspicious);
```

### 6.4 Scope-Based Access Control

**Scope Definitions:**
```typescript
const API_SCOPES = {
  // Read operations
  'users:read': 'Read user profiles',
  'incidents:read': 'Read security incidents',
  'alerts:read': 'Read security alerts',
  
  // Write operations
  'incidents:write': 'Create/update security incidents',
  'alerts:write': 'Create/update security alerts',
  
  // Admin operations
  'admin:users': 'Manage users',
  'admin:keys': 'Manage API keys',
  
  // AI operations
  'ai:detect': 'Use AI detection agent',
  'ai:investigate': 'Use AI investigation agent',
} as const;

function hasScope(requiredScope: string, grantedScopes: string[]): boolean {
  // Check exact match
  if (grantedScopes.includes(requiredScope)) {
    return true;
  }
  
  // Check wildcard scopes (e.g., "users:*" grants "users:read" and "users:write")
  const [resource, action] = requiredScope.split(':');
  if (grantedScopes.includes(`${resource}:*`)) {
    return true;
  }
  
  // Check admin wildcard
  if (grantedScopes.includes('*')) {
    return true;
  }
  
  return false;
}
```

**Scope Validation Middleware:**
```typescript
async function requireScope(requiredScope: string): Promise<void> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    throw new Error('API key required');
  }
  
  const validation = await validateAPIKey(apiKey);
  if (!validation.valid) {
    throw new Error('Invalid API key');
  }
  
  if (!hasScope(requiredScope, validation.scopes || [])) {
    throw new Error(`Insufficient scope. Required: ${requiredScope}`);
  }
}
```

### 6.5 Key Rotation Policy

**Rotation Schedule:**
- **Production Keys:** Rotate every 90 days
- **Development Keys:** Rotate every 180 days
- **Service Account Keys:** Rotate every 30 days
- **Compromised Keys:** Revoke immediately

**Rotation Process:**
```typescript
async function rotateAPIKey(keyId: string): Promise<{ newKey: string }> {
  // Get existing key
  const oldKey = await getAPIKey(keyId);
  
  // Generate new key with same properties
  const { key: newKey, key_id: newKeyId } = await generateAPIKey(
    oldKey.user_id,
    oldKey.name,
    oldKey.scopes
  );
  
  // Grace period: Keep old key active for 7 days
  await supabase
    .from('api_keys')
    .update({
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      name: `${oldKey.name} (deprecated)`,
    })
    .eq('key_id', keyId);
  
  // Notify user
  await sendNotification({
    user_id: oldKey.user_id,
    title: 'API Key Rotated',
    message: `Your API key "${oldKey.name}" has been rotated. The old key will expire in 7 days.`,
  });
  
  return { newKey };
}
```

---

## 7. Multi-Factor Authentication (MFA)

### 7.1 Supported MFA Methods

| Method | Description | Security Level | Implementation |
|--------|-------------|----------------|----------------|
| **TOTP** | Time-based One-Time Password (Google Authenticator, Authy) | High | ✅ Supabase native |
| **SMS** | Text message verification codes | Medium | ✅ Supabase + Twilio |
| **Email** | Email verification codes | Low-Medium | ✅ Supabase native |
| **WebAuthn** | Biometric/security key (FIDO2) | Very High | 🔄 Planned |

### 7.2 MFA Enforcement Policy

**Risk-Based MFA:**
```typescript
const MFA_ENFORCEMENT_RULES = [
  {
    name: 'Admin users always require MFA',
    condition: (user: User) => user.role === 'admin',
    enforce: true,
  },
  {
    name: 'New device login requires MFA',
    condition: (context: RiskContext) => context.new_device,
    enforce: true,
  },
  {
    name: 'High-risk location requires MFA',
    condition: (context: RiskContext) => context.risk_score > 60,
    enforce: true,
  },
  {
    name: 'Sensitive operation requires MFA',
    condition: (context: RiskContext) => context.sensitive_action,
    enforce: true,
  },
];

async function requiresMFA(user: User, context: RiskContext): Promise<boolean> {
  for (const rule of MFA_ENFORCEMENT_RULES) {
    if (rule.condition(user) || rule.condition(context)) {
      return true;
    }
  }
  return false;
}
```

### 7.3 TOTP Implementation

**Setup Flow:**
```typescript
async function setupTOTP(userId: string): Promise<{
  secret: string;
  qr_code: string;
  backup_codes: string[];
}> {
  // Generate TOTP secret
  const secret = generateTOTPSecret();
  
  // Generate QR code for easy setup
  const qrCode = await generateQRCode({
    secret: secret,
    issuer: 'Sloane Catalyst Hub',
    account: userId,
  });
  
  // Generate backup codes
  const backupCodes = generateBackupCodes(10);
  
  // Store hashed backup codes
  await storeBackupCodes(userId, backupCodes);
  
  // Store TOTP secret (encrypted)
  await storeTOTPSecret(userId, secret);
  
  return {
    secret: secret,
    qr_code: qrCode,
    backup_codes: backupCodes, // Show ONCE, then user must save
  };
}
```

**Verification:**
```typescript
async function verifyTOTP(userId: string, code: string): Promise<boolean> {
  // Get user's TOTP secret
  const secret = await getTOTPSecret(userId);
  if (!secret) return false;
  
  // Verify code (allow ±1 time window for clock skew)
  const isValid = verifyTOTPCode(secret, code, { window: 1 });
  
  if (isValid) {
    // Mark MFA as verified for this session
    await updateSession(userId, { mfa_verified: true });
    
    // Log MFA verification
    await logAuthEvent({
      user_id: userId,
      event_type: 'mfa_verified',
      method: 'totp',
    });
  } else {
    // Log failed attempt
    await logAuthEvent({
      user_id: userId,
      event_type: 'mfa_failed',
      method: 'totp',
    });
  }
  
  return isValid;
}
```

---

## 8. Password Security

### 8.1 Password Policy

**Requirements:**
- Minimum length: 12 characters
- Maximum length: 128 characters
- Must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- Cannot contain:
  - User's email address
  - Common passwords (checked against Have I Been Pwned)
  - Repeated characters (more than 3)
  - Sequential characters (e.g., "12345", "abcde")

**Implementation:**
```typescript
async function validatePassword(password: string, email: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Complexity checks
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Email check
  if (password.toLowerCase().includes(email.toLowerCase())) {
    errors.push('Password cannot contain your email address');
  }
  
  // Repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password cannot contain more than 3 repeated characters');
  }
  
  // Sequential characters
  if (hasSequentialChars(password)) {
    errors.push('Password cannot contain sequential characters');
  }
  
  // Check against Have I Been Pwned
  const isPwned = await checkPasswordBreach(password);
  if (isPwned) {
    errors.push('This password has been found in a data breach. Please choose a different password');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

async function checkPasswordBreach(password: string): Promise<boolean> {
  // Hash password with SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  // Use k-anonymity model (only send first 5 chars of hash)
  const prefix = hashHex.substring(0, 5);
  const suffix = hashHex.substring(5);
  
  // Query Have I Been Pwned API
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();
  
  // Check if our hash suffix appears in results
  return text.includes(suffix);
}
```

### 8.2 Password Storage

**Hashing (Supabase Auth handles this automatically):**
- Algorithm: bcrypt
- Work factor: 10 (default, can be increased)
- Salt: Unique per password

### 8.3 Password Reset Flow

**Secure Reset Process:**
```
1. User requests password reset
2. Generate time-limited reset token (1 hour expiry)
3. Send reset link via email
4. User clicks link, token validated
5. User enters new password
6. Validate password meets policy
7. Hash and store new password
8. Invalidate reset token
9. Terminate all active sessions
10. Send confirmation email
```

---

## 9. Session Management

### 9.1 Session Lifecycle

**Session States:**
```typescript
enum SessionState {
  ACTIVE = 'active',           // Normal active session
  IDLE = 'idle',              // No activity for 15 minutes
  EXPIRED = 'expired',        // Passed expiration time
  TERMINATED = 'terminated',  // Manually terminated
  LOCKED = 'locked',          // Locked due to security policy
}
```

**Timeout Configuration:**
```typescript
const SESSION_CONFIG = {
  // Absolute timeout (regardless of activity)
  max_lifetime: 8 * 60 * 60 * 1000, // 8 hours
  
  // Idle timeout (no activity)
  idle_timeout: 30 * 60 * 1000, // 30 minutes
  
  // Warning before idle timeout
  idle_warning: 25 * 60 * 1000, // 25 minutes
  
  // Token refresh interval
  refresh_interval: 50 * 60 * 1000, // 50 minutes (before 1hr expiry)
};
```

### 9.2 Session Monitoring

**Idle Detection:**
```typescript
// Client-side idle detection
class IdleMonitor {
  private lastActivity: number = Date.now();
  private warningShown: boolean = false;
  
  constructor() {
    // Track user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetActivity());
    });
    
    // Check idle status every minute
    setInterval(() => this.checkIdle(), 60 * 1000);
  }
  
  resetActivity() {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }
  
  checkIdle() {
    const idleTime = Date.now() - this.lastActivity;
    
    // Show warning at 25 minutes
    if (idleTime >= SESSION_CONFIG.idle_warning && !this.warningShown) {
      this.showIdleWarning();
      this.warningShown = true;
    }
    
    // Logout at 30 minutes
    if (idleTime >= SESSION_CONFIG.idle_timeout) {
      this.logout('Session expired due to inactivity');
    }
  }
  
  showIdleWarning() {
    // Show modal: "Your session will expire in 5 minutes due to inactivity"
    showToast({
      title: 'Session Expiring Soon',
      message: 'Your session will expire in 5 minutes due to inactivity. Click anywhere to stay logged in.',
      duration: 5 * 60 * 1000,
    });
  }
  
  async logout(reason: string) {
    await supabase.auth.signOut();
    window.location.href = `/auth?message=${encodeURIComponent(reason)}`;
  }
}
```

### 9.3 Concurrent Session Management

**Policy:**
- Default: Allow up to 3 concurrent sessions per user
- Admin users: Allow up to 2 concurrent sessions
- Oldest session terminated when limit exceeded

**Implementation:**
```typescript
async function enforceSessionLimit(userId: string): Promise<void> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  const maxSessions = await getMaxSessionsForUser(userId);
  
  if (sessions && sessions.length > maxSessions) {
    // Terminate oldest sessions
    const sessionsToTerminate = sessions.slice(maxSessions);
    
    for (const session of sessionsToTerminate) {
      await terminateSession(session.session_id, 'Session limit exceeded');
    }
  }
}
```

---

## 10. Audit & Compliance

### 10.1 Authentication Event Logging

**Logged Events:**
```typescript
const AUTH_EVENTS = {
  // Success events
  'login_success': 'User logged in successfully',
  'logout': 'User logged out',
  'mfa_verified': 'MFA verification successful',
  'password_changed': 'Password changed',
  'session_renewed': 'Session refreshed',
  
  // Failure events
  'login_failed': 'Login attempt failed',
  'mfa_failed': 'MFA verification failed',
  'token_invalid': 'Invalid token presented',
  'token_expired': 'Expired token used',
  
  // Security events
  'token_replay_detected': 'Token replay attack detected',
  'session_hijack_suspected': 'Possible session hijacking',
  'impossible_travel': 'Impossible travel detected',
  'brute_force_detected': 'Brute force attack detected',
  'account_locked': 'Account locked due to suspicious activity',
  
  // Administrative events
  'password_reset_requested': 'Password reset requested',
  'api_key_created': 'API key created',
  'api_key_revoked': 'API key revoked',
  'session_terminated': 'Session terminated by admin',
};
```

**Database Schema:**
```sql
CREATE TABLE auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    
    -- Event details
    event_type TEXT NOT NULL,
    event_category TEXT CHECK (event_category IN ('success', 'failure', 'security', 'administrative')),
    severity TEXT CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    geolocation JSONB,
    
    -- Additional metadata
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_events_user ON auth_events(user_id);
CREATE INDEX idx_auth_events_type ON auth_events(event_type);
CREATE INDEX idx_auth_events_severity ON auth_events(severity);
CREATE INDEX idx_auth_events_created ON auth_events(created_at DESC);
```

### 10.2 Compliance Reports

**ISO 27001 Evidence Collection:**
```sql
-- Authentication security metrics (A.5.15, A.5.16, A.5.17)
SELECT
  DATE_TRUNC('day', created_at) as date,
  event_category,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM auth_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_category
ORDER BY date DESC;

-- Failed authentication attempts by user
SELECT
  user_id,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_failure
FROM auth_events
WHERE event_category = 'failure'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC;

-- High-risk authentication events
SELECT
  event_type,
  severity,
  COUNT(*) as occurrences
FROM auth_events
WHERE severity IN ('high', 'critical')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type, severity
ORDER BY occurrences DESC;
```

### 10.3 Retention Policy

**Data Retention:**
- **Authentication logs:** 2 years (regulatory requirement)
- **Session data:** 90 days after session ends
- **Token fingerprints:** 90 days after token expires
- **API key usage logs:** 1 year

**Automated Cleanup:**
```sql
-- Clean up old authentication events (run daily)
DELETE FROM auth_events
WHERE created_at < NOW() - INTERVAL '2 years';

-- Clean up expired sessions (run hourly)
DELETE FROM user_sessions
WHERE is_active = false
  AND terminated_at < NOW() - INTERVAL '90 days';

-- Clean up expired token fingerprints (run daily)
DELETE FROM token_fingerprints
WHERE is_revoked = true
  AND revoked_at < NOW() - INTERVAL '90 days';
```

---

## Appendix A: Implementation Checklist

### Phase 1: Core Authentication (Week 1-2)
- [ ] Deploy authentication database schema
- [ ] Implement password validation
- [ ] Configure Supabase Auth policies
- [ ] Enable Google OAuth provider
- [ ] Set up MFA (TOTP)
- [ ] Implement session management
- [ ] Configure secure cookies

### Phase 2: Security Controls (Week 3-4)
- [ ] Implement continuous conditional access
- [ ] Deploy token replay detection
- [ ] Implement session fixation prevention
- [ ] Set up API key management
- [ ] Configure CSRF protection
- [ ] Implement rate limiting

### Phase 3: Monitoring & Compliance (Week 5-6)
- [ ] Deploy authentication event logging
- [ ] Configure security alerts
- [ ] Create compliance dashboards
- [ ] Implement automated cleanup jobs
- [ ] Document incident response procedures
- [ ] Conduct security audit

---

## Appendix B: Security Incident Response

**Token Compromise Response:**
```
1. DETECT: Replay detection flags suspicious token usage
2. ASSESS: Calculate confidence score and risk level
3. CONTAIN: Revoke compromised token immediately
4. INVESTIGATE: Review auth_events and token_usage_events
5. NOTIFY: Alert user and security team
6. RECOVER: User re-authenticates with MFA
7. IMPROVE: Update detection rules based on incident
```

**Account Takeover Response:**
```
1. DETECT: Impossible travel or high-risk login detected
2. ASSESS: Review user's recent authentication events
3. CONTAIN: Terminate all user sessions immediately
4. INVESTIGATE: Analyze login patterns and device history
5. NOTIFY: Email user about suspicious activity
6. RECOVER: User resets password and enables MFA
7. IMPROVE: Enhance conditional access policies
```

---

**Document Control:**
- **Author:** Security Operations Team
- **Technical Reviewer:** Identity & Access Management Team
- **Approved By:** CISO
- **Next Review:** March 1, 2026 (Quarterly)
- **Version History:**
  - v1.0 (2025-12-01): Initial release
