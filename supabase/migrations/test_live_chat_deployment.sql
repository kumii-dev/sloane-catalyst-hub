-- Test if Live Chat Support tables exist in Supabase
-- Run these queries in Supabase Dashboard > SQL Editor

-- ============================================================================
-- TEST 1: Check if tables exist
-- ============================================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'chat_sessions',
    'chat_messages',
    'chat_session_activity'
)
ORDER BY table_name;

-- Expected Result: 3 rows showing all three tables
-- If you get 0 rows, tables are not deployed


-- ============================================================================
-- TEST 2: Check table structures
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('chat_sessions', 'chat_messages', 'chat_session_activity')
ORDER BY table_name, ordinal_position;

-- Expected Result: ~80+ columns across the three tables


-- ============================================================================
-- TEST 3: Check if functions exist
-- ============================================================================
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'log_chat_activity',
    'analyze_chat_session',
    'flag_chat_security',
    'generate_chat_session_number'
)
ORDER BY routine_name;

-- Expected Result: 4 functions


-- ============================================================================
-- TEST 4: Check if views exist
-- ============================================================================
SELECT table_name 
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'chat_session_stats',
    'security_flagged_chat_sessions'
)
ORDER BY table_name;

-- Expected Result: 2 views


-- ============================================================================
-- TEST 5: Check RLS policies
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages', 'chat_session_activity')
ORDER BY tablename, policyname;

-- Expected Result: 11 policies


-- ============================================================================
-- TEST 6: Check indexes
-- ============================================================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages', 'chat_session_activity')
ORDER BY tablename, indexname;

-- Expected Result: Multiple indexes per table


-- ============================================================================
-- TEST 7: Check sequence for session numbers
-- ============================================================================
SELECT 
    sequencename,
    last_value,
    increment_by
FROM pg_sequences
WHERE schemaname = 'public'
AND sequencename = 'chat_session_seq';

-- Expected Result: 1 row with chat_session_seq


-- ============================================================================
-- TEST 8: Try inserting test data (OPTIONAL - use carefully)
-- ============================================================================
-- Only run this if you want to test actual functionality
-- This creates a test chat session

/*
DO $$
DECLARE
    v_test_session_id UUID;
    v_test_user_id UUID;
BEGIN
    -- Get your user ID (replace with actual user ID)
    SELECT id INTO v_test_user_id FROM auth.users LIMIT 1;
    
    -- Insert test chat session
    INSERT INTO public.chat_sessions (
        user_id,
        user_email,
        user_name,
        status,
        priority,
        category
    ) VALUES (
        v_test_user_id,
        'test@example.com',
        'Test User',
        'active',
        'normal',
        'general'
    )
    RETURNING id INTO v_test_session_id;
    
    RAISE NOTICE 'Test session created with ID: %', v_test_session_id;
    
    -- Insert test message
    INSERT INTO public.chat_messages (
        session_id,
        sender_id,
        sender_type,
        message
    ) VALUES (
        v_test_session_id,
        v_test_user_id,
        'customer',
        'This is a test message'
    );
    
    RAISE NOTICE 'Test message created';
    
    -- Clean up test data
    DELETE FROM public.chat_messages WHERE session_id = v_test_session_id;
    DELETE FROM public.chat_sessions WHERE id = v_test_session_id;
    
    RAISE NOTICE 'Test data cleaned up';
END $$;
*/


-- ============================================================================
-- COMPREHENSIVE CHECK: Get full deployment status
-- ============================================================================
SELECT 
    'Tables' AS component_type,
    COUNT(*) AS count,
    3 AS expected,
    CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_sessions', 'chat_messages', 'chat_session_activity')

UNION ALL

SELECT 
    'Functions',
    COUNT(*),
    4,
    CASE WHEN COUNT(*) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('log_chat_activity', 'analyze_chat_session', 'flag_chat_security', 'generate_chat_session_number')

UNION ALL

SELECT 
    'Views',
    COUNT(*),
    2,
    CASE WHEN COUNT(*) = 2 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('chat_session_stats', 'security_flagged_chat_sessions')

UNION ALL

SELECT 
    'RLS Policies',
    COUNT(*),
    11,
    CASE WHEN COUNT(*) >= 11 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages', 'chat_session_activity')

UNION ALL

SELECT 
    'Sequences',
    COUNT(*),
    1,
    CASE WHEN COUNT(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_sequences
WHERE schemaname = 'public'
AND sequencename = 'chat_session_seq';

-- Expected output:
-- component_type | count | expected | status
-- ---------------|-------|----------|--------
-- Tables         |   3   |    3     | ✅ PASS
-- Functions      |   4   |    4     | ✅ PASS
-- Views          |   2   |    2     | ✅ PASS
-- RLS Policies   |  11   |   11     | ✅ PASS
-- Sequences      |   1   |    1     | ✅ PASS
