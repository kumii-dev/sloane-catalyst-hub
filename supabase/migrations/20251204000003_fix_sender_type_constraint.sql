-- Fix: Update sender_type constraint and RLS policy to match
-- The CHECK constraint only allows: 'customer', 'agent', 'system', 'bot'
-- But the code sends 'support_agent'
-- Solution: Add 'support_agent' to allowed values

-- Step 1: Drop the old constraint
ALTER TABLE public.chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;

-- Step 2: Add new constraint with 'support_agent' included
ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_type_check 
CHECK (sender_type IN ('customer', 'agent', 'support_agent', 'system', 'bot'));

-- Step 3: Update the RLS policy to use 'agent' OR 'support_agent'
DROP POLICY IF EXISTS "Users and support agents can create messages" ON public.chat_messages;

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
        -- Support agents can message ANY session (accepts both 'agent' and 'support_agent')
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
'Allows customers to message their own sessions, and support agents (agent/support_agent) to message any session';
