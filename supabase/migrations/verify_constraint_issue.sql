-- Quick verification: Check the current CHECK constraint
-- This will show you WHY the message is failing

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_messages'::regclass
AND conname = 'chat_messages_sender_type_check';

-- Current result will show:
-- CHECK (sender_type IN ('customer', 'agent', 'system', 'bot'))
-- 
-- Notice: 'support_agent' is MISSING!
-- That's why your INSERT fails.
--
-- After running the fix migration (20251204000003_fix_sender_type_constraint.sql),
-- it will show:
-- CHECK (sender_type IN ('customer', 'agent', 'support_agent', 'system', 'bot'))
