-- Fix: Allow support agents to send messages to ANY chat session
-- Previous policy was too restrictive

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create messages in own sessions" ON public.chat_messages;

-- Create a new, more flexible policy
CREATE POLICY "Users and support agents can create messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        -- Regular users can message their own sessions
        (
            sender_type = 'customer'
            AND EXISTS (
                SELECT 1 FROM public.chat_sessions
                WHERE id = session_id AND user_id = auth.uid()
            )
        )
        -- Support agents can message ANY session
        OR
        (
            sender_type = 'support_agent'
            AND EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
            )
        )
    )
);

-- Add comment explaining the policy
COMMENT ON POLICY "Users and support agents can create messages" ON public.chat_messages IS 
'Allows customers to message their own sessions, and support agents to message any session they are handling';
