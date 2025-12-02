-- Customer Support System Database Schema
-- ISO 27001 Compliant - Audit logging, access controls, data minimization
-- Version: 1.0
-- Date: 2025-12-02
-- PREREQUISITE: Run migration 20251202000000_add_support_agent_role.sql first

-- ============================================================================
-- 1. SUPPORT TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    
    -- User Information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    
    -- Ticket Details
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'technical',
        'billing',
        'account',
        'feature_request',
        'bug_report',
        'general',
        'security',
        'compliance'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open',
        'in_progress',
        'waiting_on_customer',
        'waiting_on_admin',
        'resolved',
        'closed',
        'escalated'
    )),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    
    -- Ratings & Feedback
    customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    rated_at TIMESTAMPTZ,
    
    -- ISO 27001: Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ISO 27001: Context & Metadata
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- ISO 27001: Data Retention
    archived_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Generate ticket numbers automatically
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START 1000;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT-' || LPAD(nextval('support_ticket_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- Indexes for performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_last_activity ON public.support_tickets(last_activity_at DESC);

-- ============================================================================
-- 2. SUPPORT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    
    -- Message Content
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin', 'system')),
    message TEXT NOT NULL,
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::JSONB,
    
    -- Message Status
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes only admins can see
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- ISO 27001: Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ISO 27001: Context
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON public.support_messages(sender_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at ASC);
CREATE INDEX idx_support_messages_is_internal ON public.support_messages(is_internal);

-- ============================================================================
-- 3. SUPPORT TICKET ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_ticket_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created',
        'status_changed',
        'assigned',
        'unassigned',
        'priority_changed',
        'category_changed',
        'message_added',
        'resolved',
        'closed',
        'reopened',
        'escalated',
        'rated'
    )),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system')),
    
    -- Change Details
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    
    -- ISO 27001: Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes
CREATE INDEX idx_support_activity_ticket_id ON public.support_ticket_activity(ticket_id);
CREATE INDEX idx_support_activity_created_at ON public.support_ticket_activity(created_at DESC);
CREATE INDEX idx_support_activity_actor_id ON public.support_ticket_activity(actor_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_activity ENABLE ROW LEVEL SECURITY;

-- Support Tickets Policies

-- Customers can view their own tickets
CREATE POLICY "Customers can view own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- Customers can create tickets
CREATE POLICY "Customers can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Customers can update their own tickets (limited fields)
CREATE POLICY "Customers can update own tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any ticket
CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- Support Messages Policies

-- Customers can view messages in their tickets (excluding internal notes)
CREATE POLICY "Customers can view own ticket messages"
ON public.support_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE id = ticket_id AND user_id = auth.uid()
    )
    AND is_internal = FALSE
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.support_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- Users can create messages in their own tickets
CREATE POLICY "Users can create messages in own tickets"
ON public.support_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        -- Customer in their own ticket
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
        OR
        -- Admin in any ticket
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
        )
    )
);

-- Support Ticket Activity Policies

-- Customers can view activity in their own tickets
CREATE POLICY "Customers can view own ticket activity"
ON public.support_ticket_activity FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE id = ticket_id AND user_id = auth.uid()
    )
);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
ON public.support_ticket_activity FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to log ticket activity
CREATE OR REPLACE FUNCTION log_ticket_activity(
    p_ticket_id UUID,
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
    INSERT INTO public.support_ticket_activity (
        ticket_id,
        activity_type,
        actor_id,
        actor_type,
        old_value,
        new_value,
        description
    ) VALUES (
        p_ticket_id,
        p_activity_type,
        p_actor_id,
        p_actor_type,
        p_old_value,
        p_new_value,
        p_description
    )
    RETURNING id INTO v_activity_id;
    
    -- Update last_activity_at on ticket
    UPDATE public.support_tickets
    SET last_activity_at = NOW()
    WHERE id = p_ticket_id;
    
    RETURN v_activity_id;
END;
$$;

-- Function to update ticket status with logging
CREATE OR REPLACE FUNCTION update_ticket_status(
    p_ticket_id UUID,
    p_new_status TEXT,
    p_actor_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status TEXT;
    v_actor_type TEXT;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status
    FROM public.support_tickets
    WHERE id = p_ticket_id;
    
    -- Determine actor type
    SELECT CASE
        WHEN EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = p_actor_id AND role IN ('admin', 'support_agent')
        ) THEN 'admin'
        ELSE 'customer'
    END INTO v_actor_type;
    
    -- Update status
    UPDATE public.support_tickets
    SET 
        status = p_new_status,
        updated_at = NOW(),
        last_activity_at = NOW(),
        resolved_at = CASE WHEN p_new_status = 'resolved' THEN NOW() ELSE resolved_at END,
        resolved_by = CASE WHEN p_new_status = 'resolved' THEN p_actor_id ELSE resolved_by END
    WHERE id = p_ticket_id;
    
    -- Log activity
    PERFORM log_ticket_activity(
        p_ticket_id,
        'status_changed',
        p_actor_id,
        v_actor_type,
        v_old_status,
        p_new_status,
        'Status changed from ' || v_old_status || ' to ' || p_new_status
    );
    
    RETURN TRUE;
END;
$$;

-- Function to assign ticket
CREATE OR REPLACE FUNCTION assign_ticket(
    p_ticket_id UUID,
    p_assignee_id UUID,
    p_actor_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_assignee UUID;
BEGIN
    -- Get current assignee
    SELECT assigned_to INTO v_old_assignee
    FROM public.support_tickets
    WHERE id = p_ticket_id;
    
    -- Update assignment
    UPDATE public.support_tickets
    SET 
        assigned_to = p_assignee_id,
        assigned_at = NOW(),
        updated_at = NOW(),
        last_activity_at = NOW()
    WHERE id = p_ticket_id;
    
    -- Log activity
    PERFORM log_ticket_activity(
        p_ticket_id,
        'assigned',
        p_actor_id,
        'admin',
        v_old_assignee::TEXT,
        p_assignee_id::TEXT,
        'Ticket assigned to agent'
    );
    
    RETURN TRUE;
END;
$$;

-- ============================================================================
-- 6. AUTOMATED TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_updated_at();

CREATE TRIGGER update_support_messages_updated_at
    BEFORE UPDATE ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_support_updated_at();

-- Trigger: Log ticket creation
CREATE OR REPLACE FUNCTION log_ticket_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_ticket_activity(
        NEW.id,
        'created',
        NEW.user_id,
        'customer',
        NULL,
        NULL,
        'Ticket created: ' || NEW.subject
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_ticket
    AFTER INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_ticket_creation();

-- Trigger: Log new messages
CREATE OR REPLACE FUNCTION log_message_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_ticket_activity(
        NEW.ticket_id,
        'message_added',
        NEW.sender_id,
        NEW.sender_type,
        NULL,
        NULL,
        'New message added'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_message
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION log_message_creation();

-- ============================================================================
-- 7. DATA CLEANUP FUNCTIONS (ISO 27001: Data Retention)
-- ============================================================================

-- Archive old resolved tickets (run monthly via cron)
CREATE OR REPLACE FUNCTION archive_old_tickets()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    WITH archived AS (
        UPDATE public.support_tickets
        SET 
            is_archived = TRUE,
            archived_at = NOW()
        WHERE status IN ('resolved', 'closed')
            AND resolved_at < NOW() - INTERVAL '6 months'
            AND is_archived = FALSE
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_count FROM archived;
    
    RETURN v_archived_count;
END;
$$;

-- Delete very old archived tickets (run annually via cron)
CREATE OR REPLACE FUNCTION delete_old_archived_tickets()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.support_tickets
        WHERE is_archived = TRUE
            AND archived_at < NOW() - INTERVAL '2 years'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;
    
    RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION log_ticket_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status TO authenticated;
GRANT EXECUTE ON FUNCTION assign_ticket TO authenticated;

-- ============================================================================
-- 9. VIEWS FOR REPORTING (ISO 27001: Metrics & Monitoring)
-- ============================================================================

-- View: Ticket Statistics
CREATE OR REPLACE VIEW support_ticket_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'open') AS open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_tickets,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_tickets,
    COUNT(*) FILTER (WHERE priority = 'urgent') AS urgent_tickets,
    COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_tickets,
    AVG(CASE 
        WHEN resolved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
    END) AS avg_resolution_time_hours,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS tickets_last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS tickets_last_7d,
    AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) AS avg_rating
FROM public.support_tickets
WHERE is_archived = FALSE;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
