-- Fix: Add missing INSERT policy for chat_session_activity
-- This policy allows the system and admins to log activity

-- Add the missing policy
CREATE POLICY "System can log chat activity"
ON public.chat_session_activity FOR INSERT
WITH CHECK (
    -- Allow if user is the actor (self-logging)
    auth.uid() = actor_id
    OR
    -- Allow if user is admin/support_agent
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
    )
);

-- Verify the fix
SELECT 
    'RLS Policies' AS component_type,
    COUNT(*) AS count,
    11 AS expected,
    CASE WHEN COUNT(*) >= 11 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages', 'chat_session_activity');

-- Should now show: count = 11, status = ✅ PASS
