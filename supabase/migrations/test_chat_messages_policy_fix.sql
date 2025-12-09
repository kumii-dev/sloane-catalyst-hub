-- Test the fixed RLS policy for chat message insertion
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Verify the new policy exists
-- ============================================================================
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'chat_messages'
AND cmd = 'INSERT';

-- Expected: Should show "Users and support agents can create messages" policy


-- ============================================================================
-- STEP 2: Test support agent can insert message (MANUAL TEST)
-- ============================================================================
-- Replace the UUIDs below with actual values from your database
-- 1. Get a support agent user_id from user_roles table
-- 2. Get a customer's chat session_id from chat_sessions table

/*
-- Example test (replace with your actual IDs):

INSERT INTO public.chat_messages (
    session_id,
    sender_id,
    sender_type,
    message,
    is_internal
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- Replace with actual session_id
    '00000000-0000-0000-0000-000000000000',  -- Replace with your support agent user_id
    'support_agent',
    'Test message from support agent',
    false
);

-- If successful: Message inserted ✅
-- If fails: Check user_roles table has support_agent role
*/


-- ============================================================================
-- STEP 3: Verify support agent has the role
-- ============================================================================
-- Replace with your user_id
/*
SELECT 
    user_id,
    role,
    created_at
FROM public.user_roles
WHERE user_id = '00000000-0000-0000-0000-000000000000'  -- Your user_id here
AND role IN ('admin', 'support_agent');

-- Expected: At least 1 row showing admin or support_agent role
*/


-- ============================================================================
-- STEP 4: Check all chat message policies
-- ============================================================================
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '📖 Read'
        WHEN cmd = 'INSERT' THEN '✍️ Write'
        WHEN cmd = 'UPDATE' THEN '✏️ Update'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete'
    END as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'chat_messages'
ORDER BY cmd, policyname;

-- Expected: 3 policies total
-- 1. SELECT - Users can view messages in own sessions
-- 2. SELECT - Admins can view all messages  
-- 3. INSERT - Users and support agents can create messages
