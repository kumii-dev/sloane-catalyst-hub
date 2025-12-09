-- Verify the CHECK constraint fix was applied successfully

-- Check 1: Verify the new constraint includes 'support_agent'
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_messages'::regclass
AND conname = 'chat_messages_sender_type_check';

-- Expected result should show:
-- CHECK (sender_type = ANY (ARRAY['customer'::text, 'agent'::text, 'support_agent'::text, 'system'::text, 'bot'::text]))
-- Or in simpler form:
-- CHECK (sender_type IN ('customer', 'agent', 'support_agent', 'system', 'bot'))


-- Check 2: Verify the RLS policy accepts 'agent' and 'support_agent'
SELECT 
    policyname,
    cmd,
    with_check::text
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'chat_messages'
AND policyname = 'Users and support agents can create messages';

-- Expected: Should show policy exists with INSERT command
