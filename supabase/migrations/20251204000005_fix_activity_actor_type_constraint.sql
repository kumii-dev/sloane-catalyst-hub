-- Fix: Add 'support_agent' to chat_session_activity actor_type constraint
-- The trigger log_chat_message_creation passes sender_type = 'support_agent'
-- but the activity table's CHECK constraint doesn't allow it

-- Step 1: Drop the old constraint
ALTER TABLE public.chat_session_activity 
DROP CONSTRAINT IF EXISTS chat_session_activity_actor_type_check;

-- Step 2: Add new constraint including 'support_agent'
ALTER TABLE public.chat_session_activity
ADD CONSTRAINT chat_session_activity_actor_type_check 
CHECK (actor_type IN ('customer', 'agent', 'support_agent', 'admin', 'system', 'ai', 'bot'));

-- Note: Added 'bot' as well for future-proofing since chat_messages allows it
