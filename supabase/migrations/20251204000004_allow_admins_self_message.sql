-- Fix: Allow admins/support agents to message their own sessions too
-- This handles the case where an admin tests the feature by creating a customer session
-- and then switching to admin mode to respond to themselves

DROP POLICY IF EXISTS "Users and support agents can create messages" ON public.chat_messages;

CREATE POLICY "Users and support agents can create messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        -- Regular customers can message their own sessions
        (
            sender_type = 'customer'
            AND EXISTS (
                SELECT 1 FROM public.chat_sessions
                WHERE id = session_id AND user_id = auth.uid()
            )
        )
        -- Support agents/admins can message ANY session (no session ownership check)
        OR
        (
            sender_type IN ('agent', 'support_agent')
            AND EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
            )
        )
    )
);

COMMENT ON POLICY "Users and support agents can create messages" ON public.chat_messages IS 
'Allows customers to message their own sessions, and support agents/admins to message ANY session (including sessions they created as customers for testing)';
