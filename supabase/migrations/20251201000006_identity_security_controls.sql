-- Identity & Authentication Security Database Schema
-- Version: 1.0
-- Date: 2025-12-01

-- ============================================================================
-- 1. AUTHENTICATION CONTEXT LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_context_log (
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
    risk_factors JSONB,
    
    -- Policy decision
    policy_decision TEXT CHECK (policy_decision IN ('allow', 'challenge', 'block', 'terminate')),
    policy_reason TEXT,
    
    -- Behavioral signals
    is_new_device BOOLEAN DEFAULT false,
    is_impossible_travel BOOLEAN DEFAULT false,
    login_velocity INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_context_user ON auth_context_log(user_id);
CREATE INDEX idx_auth_context_created ON auth_context_log(created_at DESC);
CREATE INDEX idx_auth_context_risk ON auth_context_log(risk_score DESC);
CREATE INDEX idx_auth_context_decision ON auth_context_log(policy_decision);

-- Enable RLS
ALTER TABLE auth_context_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view own auth context"
ON auth_context_log FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all auth context"
ON auth_context_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 2. TOKEN FINGERPRINTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_fingerprints (
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
    unique_ips TEXT[],
    unique_devices TEXT[],
    
    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_fingerprints_token ON token_fingerprints(token_id);
CREATE INDEX idx_token_fingerprints_user ON token_fingerprints(user_id);
CREATE INDEX idx_token_fingerprints_revoked ON token_fingerprints(is_revoked);

-- Enable RLS
ALTER TABLE token_fingerprints ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own token fingerprints
CREATE POLICY "Users can view own token fingerprints"
ON token_fingerprints FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all token fingerprints
CREATE POLICY "Admins can view all token fingerprints"
ON token_fingerprints FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 3. TOKEN USAGE EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Context
    ip_address INET NOT NULL,
    device_fingerprint TEXT,
    user_agent TEXT,
    endpoint TEXT,
    
    -- Replay detection
    is_suspicious BOOLEAN DEFAULT false,
    suspicion_score INTEGER,
    suspicion_reasons TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_usage_token ON token_usage_events(token_id);
CREATE INDEX idx_token_usage_user ON token_usage_events(user_id);
CREATE INDEX idx_token_usage_created ON token_usage_events(created_at DESC);
CREATE INDEX idx_token_usage_suspicious ON token_usage_events(is_suspicious);

-- Enable RLS
ALTER TABLE token_usage_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own token usage
CREATE POLICY "Users can view own token usage"
ON token_usage_events FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- 4. USER SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON user_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CSRF TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS csrf_tokens (
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

-- Enable RLS
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. API KEYS
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id UUID UNIQUE NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    prefix TEXT NOT NULL,
    
    -- Ownership
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Permissions
    scopes TEXT[] NOT NULL,
    
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

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own API keys
CREATE POLICY "Users can view own API keys"
ON api_keys FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own API keys
CREATE POLICY "Users can create own API keys"
ON api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own API keys
CREATE POLICY "Users can update own API keys"
ON api_keys FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
ON api_keys FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 7. API KEY USAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_key_usage (
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

-- Enable RLS
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. AUTHENTICATION EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_events (
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
CREATE INDEX idx_auth_events_category ON auth_events(event_category);

-- Enable RLS
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own auth events
CREATE POLICY "Users can view own auth events"
ON auth_events FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all auth events
CREATE POLICY "Admins can view all auth events"
ON auth_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function: Log authentication event
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_category TEXT,
  p_severity TEXT,
  p_ip_address INET DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO auth_events (
    user_id,
    event_type,
    event_category,
    severity,
    ip_address,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_category,
    p_severity,
    p_ip_address,
    p_metadata
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function: Get user's active sessions
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
  session_id UUID,
  ip_address INET,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  mfa_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.session_id,
    s.ip_address,
    s.device_fingerprint,
    s.created_at,
    s.last_activity_at,
    s.mfa_verified
  FROM user_sessions s
  WHERE s.user_id = p_user_id
    AND s.is_active = true
    AND s.expires_at > NOW()
  ORDER BY s.created_at DESC;
END;
$$;

-- Function: Terminate session
CREATE OR REPLACE FUNCTION terminate_session(
  p_session_id UUID,
  p_reason TEXT DEFAULT 'Manual termination'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id before terminating
  SELECT user_id INTO v_user_id
  FROM user_sessions
  WHERE session_id = p_session_id;
  
  -- Update session
  UPDATE user_sessions
  SET
    is_active = false,
    terminated_at = NOW(),
    termination_reason = p_reason
  WHERE session_id = p_session_id;
  
  -- Log event
  PERFORM log_auth_event(
    v_user_id,
    'session_terminated',
    'administrative',
    'info',
    NULL,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN true;
END;
$$;

-- Function: Revoke token
CREATE OR REPLACE FUNCTION revoke_token(
  p_token_id UUID,
  p_reason TEXT DEFAULT 'Manual revocation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE token_fingerprints
  SET
    is_revoked = true,
    revoked_at = NOW(),
    revoke_reason = p_reason
  WHERE token_id = p_token_id;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- 10. AUTOMATED CLEANUP JOBS
-- ============================================================================

-- Clean up expired sessions (run hourly via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM user_sessions
    WHERE is_active = false
      AND terminated_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  RETURN v_deleted_count;
END;
$$;

-- Clean up old auth events (run daily via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_old_auth_events()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM auth_events
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  RETURN v_deleted_count;
END;
$$;

-- Clean up expired token fingerprints (run daily via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM token_fingerprints
    WHERE is_revoked = true
      AND revoked_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  RETURN v_deleted_count;
END;
$$;

-- Clean up expired CSRF tokens (run hourly via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM csrf_tokens
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_auth_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION terminate_session TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_token TO authenticated;
