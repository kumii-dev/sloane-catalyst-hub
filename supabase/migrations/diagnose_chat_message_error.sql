-- Diagnostic queries to troubleshoot "Failed to send message" error
-- Run these in Supabase SQL Editor while logged in as the support agent user

-- ============================================================================
-- STEP 1: Check your current user ID
-- ============================================================================
SELECT 
    auth.uid() as your_user_id,
    auth.email() as your_email;

-- Copy the user_id from the result above and use it in the queries below


-- ============================================================================
-- STEP 2: Check if you have support_agent role
-- ============================================================================
-- Replace 'YOUR_USER_ID' with the actual UUID from STEP 1
SELECT 
    user_id,
    role,
    created_at
FROM public.user_roles
WHERE user_id = auth.uid()  -- This uses your current logged-in user
ORDER BY created_at;

-- Expected: Should show at least one row with role = 'support_agent' or 'admin'
-- If empty: You don't have the role assigned!


-- ============================================================================
-- STEP 3: Check if there are any chat sessions to message
-- ============================================================================
SELECT 
    id as session_id,
    user_id as customer_user_id,
    user_email as customer_email,
    status,
    created_at
FROM public.chat_sessions
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Should show at least one session
-- Copy a session_id from the results for the next test


-- ============================================================================
-- STEP 4: Test the policy manually (DRY RUN)
-- ============================================================================
-- This simulates what the policy checks
-- Replace the session_id below with an actual ID from STEP 3

DO $$
DECLARE
    v_session_id UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE THIS
    v_current_user UUID;
    v_has_role BOOLEAN;
BEGIN
    -- Get current user
    v_current_user := auth.uid();
    
    RAISE NOTICE 'Current User ID: %', v_current_user;
    
    -- Check if user has support_agent role
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = v_current_user 
        AND role IN ('admin', 'support_agent')
    ) INTO v_has_role;
    
    RAISE NOTICE 'Has support_agent role: %', v_has_role;
    
    IF v_has_role THEN
        RAISE NOTICE '✅ Policy check would PASS - You should be able to send messages';
    ELSE
        RAISE NOTICE '❌ Policy check would FAIL - You need support_agent or admin role';
    END IF;
END $$;


-- ============================================================================
-- STEP 5: Try to insert a test message (ACTUAL TEST)
-- ============================================================================
-- Replace these values:
--   - session_id: Use an ID from STEP 3
--   - sender_id: Use your user_id from STEP 1

/*
INSERT INTO public.chat_messages (
    session_id,
    sender_id,
    sender_type,
    message,
    is_internal
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- session_id from STEP 3
    auth.uid(),                               -- Your user_id
    'support_agent',
    'Test message from diagnostic script',
    false
);

-- If successful: Message inserted! The issue is in the frontend code
-- If fails with RLS error: The policy or role assignment has issues
*/


-- ============================================================================
-- STEP 6: Check the exact policy definition
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'chat_messages'
AND cmd = 'INSERT';

-- Verify the with_check clause mentions 'support_agent'


-- ============================================================================
-- STEP 7: Check table structure matches code
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'chat_messages'
AND column_name IN ('session_id', 'sender_id', 'sender_type', 'message', 'is_internal')
ORDER BY ordinal_position;

-- Verify all columns exist and have correct types


-- ============================================================================
-- STEP 8: Check for any check constraints that might fail
-- ============================================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_messages'::regclass
AND contype = 'c';  -- Check constraints

-- Look for any constraints on sender_type or other fields
