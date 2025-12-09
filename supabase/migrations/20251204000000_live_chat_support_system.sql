-- Live Chat Support System
-- Integrated with Incident Management, Security Operations, and SIEM Dashboard
-- Date: 2025-12-04

-- ============================================================================
-- 1. CHAT SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number TEXT UNIQUE NOT NULL,
    
    -- User Information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    
    -- Session Details
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'waiting',
        'assigned',
        'resolved',
        'closed',
        'escalated',
        'abandoned'
    )),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT CHECK (category IN (
        'technical_support',
        'account_help',
        'billing',
        'security_concern',
        'feature_question',
        'bug_report',
        'general'
    )),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    
    -- AI Analysis (Integration with Security Operations)
    is_analyzed BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMPTZ,
    analyzed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ai_summary TEXT,
    ai_sentiment JSONB, -- {overall: 'positive|neutral|negative', scores: {...}}
    ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
    ai_detected_issues JSONB DEFAULT '[]'::JSONB, -- Array of detected security/compliance issues
    ai_recommended_actions JSONB DEFAULT '[]'::JSONB,
    
    -- Security Integration
    linked_incident_id UUID, -- Link to security incidents
    security_flagged BOOLEAN DEFAULT FALSE,
    security_flag_reason TEXT,
    
    -- Ratings & Feedback
    customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    rated_at TIMESTAMPTZ,
    
    -- Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context & Metadata
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Data Retention
    archived_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Generate session numbers automatically
CREATE SEQUENCE IF NOT EXISTS chat_session_seq START 1000;

CREATE OR REPLACE FUNCTION generate_chat_session_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.session_number := 'CHAT-' || LPAD(nextval('chat_session_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_chat_session_number
    BEFORE INSERT ON public.chat_sessions
    FOR EACH ROW
    WHEN (NEW.session_number IS NULL)
    EXECUTE FUNCTION generate_chat_session_number();

-- Indexes
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX idx_chat_sessions_assigned_to ON public.chat_sessions(assigned_to);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_is_analyzed ON public.chat_sessions(is_analyzed);
CREATE INDEX idx_chat_sessions_security_flagged ON public.chat_sessions(security_flagged);
CREATE INDEX idx_chat_sessions_linked_incident ON public.chat_sessions(linked_incident_id);

-- ============================================================================
-- 2. CHAT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    
    -- Message Content
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system', 'bot')),
    message TEXT NOT NULL,
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::JSONB,
    
    -- Message Status
    is_internal BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- AI Analysis
    ai_flagged BOOLEAN DEFAULT FALSE,
    ai_flag_reason TEXT,
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    
    -- Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at ASC);
CREATE INDEX idx_chat_messages_ai_flagged ON public.chat_messages(ai_flagged);

-- ============================================================================
-- 3. CHAT SESSION ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_session_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'session_started',
        'agent_joined',
        'agent_left',
        'status_changed',
        'priority_changed',
        'escalated',
        'message_sent',
        'analyzed',
        'security_flagged',
        'incident_created',
        'resolved',
        'closed',
        'rated'
    )),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'agent', 'admin', 'system', 'ai')),
    
    -- Change Details
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    
    -- Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes
CREATE INDEX idx_chat_activity_session_id ON public.chat_session_activity(session_id);
CREATE INDEX idx_chat_activity_created_at ON public.chat_session_activity(created_at DESC);
CREATE INDEX idx_chat_activity_actor_id ON public.chat_session_activity(actor_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_session_activity ENABLE ROW LEVEL SECURITY;

-- Chat Sessions Policies

CREATE POLICY "Users can view own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and agents can view all chat sessions"
ON public.chat_sessions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
ON public.chat_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any chat session"
ON public.chat_sessions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- Chat Messages Policies

CREATE POLICY "Users can view messages in own sessions"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = session_id AND user_id = auth.uid()
    )
    AND is_internal = FALSE
);

CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

CREATE POLICY "Users can create messages in own sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
        )
    )
);

-- Chat Activity Policies

CREATE POLICY "Users can view activity in own sessions"
ON public.chat_session_activity FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = session_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all activity"
ON public.chat_session_activity FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

CREATE POLICY "System can log chat activity"
ON public.chat_session_activity FOR INSERT
WITH CHECK (
    auth.uid() = actor_id
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to log chat activity
CREATE OR REPLACE FUNCTION log_chat_activity(
    p_session_id UUID,
    p_activity_type TEXT,
    p_actor_id UUID,
    p_actor_type TEXT,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO public.chat_session_activity (
        session_id,
        activity_type,
        actor_id,
        actor_type,
        old_value,
        new_value,
        description
    ) VALUES (
        p_session_id,
        p_activity_type,
        p_actor_id,
        p_actor_type,
        p_old_value,
        p_new_value,
        p_description
    )
    RETURNING id INTO v_activity_id;
    
    -- Update last_activity_at on session
    UPDATE public.chat_sessions
    SET last_activity_at = NOW()
    WHERE id = p_session_id;
    
    RETURN v_activity_id;
END;
$$;

-- Function to analyze chat session (for AI integration)
CREATE OR REPLACE FUNCTION analyze_chat_session(
    p_session_id UUID,
    p_analyzer_id UUID,
    p_ai_summary TEXT,
    p_ai_sentiment JSONB DEFAULT NULL,
    p_ai_risk_score INTEGER DEFAULT NULL,
    p_ai_detected_issues JSONB DEFAULT '[]'::JSONB,
    p_ai_recommended_actions JSONB DEFAULT '[]'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.chat_sessions
    SET 
        is_analyzed = TRUE,
        analyzed_at = NOW(),
        analyzed_by = p_analyzer_id,
        ai_summary = p_ai_summary,
        ai_sentiment = p_ai_sentiment,
        ai_risk_score = p_ai_risk_score,
        ai_detected_issues = p_ai_detected_issues,
        ai_recommended_actions = p_ai_recommended_actions,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Log activity
    PERFORM log_chat_activity(
        p_session_id,
        'analyzed',
        p_analyzer_id,
        'admin',
        NULL,
        NULL,
        'Chat session analyzed by AI'
    );
    
    RETURN TRUE;
END;
$$;

-- Function to flag chat session for security review
CREATE OR REPLACE FUNCTION flag_chat_security(
    p_session_id UUID,
    p_flagged_by UUID,
    p_flag_reason TEXT,
    p_create_incident BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_incident_id UUID;
BEGIN
    UPDATE public.chat_sessions
    SET 
        security_flagged = TRUE,
        security_flag_reason = p_flag_reason,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Log activity
    PERFORM log_chat_activity(
        p_session_id,
        'security_flagged',
        p_flagged_by,
        'admin',
        NULL,
        NULL,
        'Security flag raised: ' || p_flag_reason
    );
    
    -- Optionally create incident (integration point)
    IF p_create_incident THEN
        -- This would integrate with your security_incidents table
        -- For now, just log it
        PERFORM log_chat_activity(
            p_session_id,
            'incident_created',
            p_flagged_by,
            'system',
            NULL,
            NULL,
            'Security incident created from chat session'
        );
    END IF;
    
    RETURN v_incident_id;
END;
$$;

-- ============================================================================
-- 6. AUTOMATED TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

-- Trigger: Log session creation
CREATE OR REPLACE FUNCTION log_chat_session_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_chat_activity(
        NEW.id,
        'session_started',
        NEW.user_id,
        'customer',
        NULL,
        NULL,
        'Chat session started'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_chat_session
    AFTER INSERT ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_chat_session_creation();

-- Trigger: Log new messages
CREATE OR REPLACE FUNCTION log_chat_message_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_chat_activity(
        NEW.session_id,
        'message_sent',
        NEW.sender_id,
        NEW.sender_type,
        NULL,
        NULL,
        'New message: ' || LEFT(NEW.message, 50) || '...'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_chat_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION log_chat_message_creation();

-- ============================================================================
-- 7. VIEWS FOR REPORTING
-- ============================================================================

-- View: Chat Session Statistics
CREATE OR REPLACE VIEW chat_session_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'active') AS active_sessions,
    COUNT(*) FILTER (WHERE status = 'waiting') AS waiting_sessions,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_sessions,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_sessions,
    COUNT(*) FILTER (WHERE security_flagged = TRUE) AS security_flagged_count,
    COUNT(*) FILTER (WHERE is_analyzed = TRUE) AS analyzed_count,
    AVG(CASE 
        WHEN resolved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/60 
    END) AS avg_resolution_time_minutes,
    AVG(ai_risk_score) FILTER (WHERE ai_risk_score IS NOT NULL) AS avg_risk_score,
    AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) AS avg_rating,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS sessions_last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS sessions_last_7d
FROM public.chat_sessions
WHERE is_archived = FALSE;

-- View: Security-Flagged Sessions for SIEM Integration
CREATE OR REPLACE VIEW security_flagged_chat_sessions AS
SELECT
    cs.id,
    cs.session_number,
    cs.user_email,
    cs.user_name,
    cs.security_flag_reason,
    cs.ai_risk_score,
    cs.ai_detected_issues,
    cs.linked_incident_id,
    cs.created_at,
    cs.resolved_at,
    COUNT(cm.id) AS message_count,
    MAX(cm.created_at) AS last_message_at
FROM public.chat_sessions cs
LEFT JOIN public.chat_messages cm ON cm.session_id = cs.id
WHERE cs.security_flagged = TRUE
AND cs.is_archived = FALSE
GROUP BY cs.id;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION log_chat_activity TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_chat_session TO authenticated;
GRANT EXECUTE ON FUNCTION flag_chat_security TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
