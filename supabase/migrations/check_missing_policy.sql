-- Check which RLS policies are actually deployed
-- Run this to see which policies exist

SELECT 
    tablename,
    policyname,
    cmd AS operation,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages', 'chat_session_activity')
ORDER BY tablename, policyname;

-- This will show you exactly which 10 policies are deployed
-- Compare with the expected 11 policies below:

-- Expected Policies:
-- 
-- chat_sessions (5 policies):
-- 1. "Users can view own chat sessions" - SELECT
-- 2. "Admins and agents can view all chat sessions" - SELECT
-- 3. "Users can create chat sessions" - INSERT
-- 4. "Users can update own chat sessions" - UPDATE
-- 5. "Admins can update any chat session" - UPDATE
--
-- chat_messages (3 policies):
-- 6. "Users can view messages in own sessions" - SELECT
-- 7. "Admins can view all messages" - SELECT
-- 8. "Users can create messages in own sessions" - INSERT
--
-- chat_session_activity (3 policies):
-- 9. "Users can view activity in own sessions" - SELECT
-- 10. "Admins can view all activity" - SELECT
-- 11. Missing policy - likely INSERT for activity logging
