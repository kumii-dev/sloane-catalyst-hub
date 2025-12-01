-- Quick Admin Upgrade Script
-- User: mncubekhulekani@gmail.com
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this script
-- 5. Click "Run" or press Ctrl+Enter
-- 6. Check the results to confirm

-- This script will automatically:
-- 1. Find the user by email
-- 2. Grant admin role
-- 3. Show confirmation

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'mncubekhulekani@gmail.com';
BEGIN
  -- Find the user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ERROR: User with email % not found!', v_email;
    RAISE NOTICE 'Please verify:';
    RAISE NOTICE '1. User has signed up';
    RAISE NOTICE '2. Email is spelled correctly';
  ELSE
    -- Grant admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) 
    DO UPDATE SET created_at = now();
    
    RAISE NOTICE '✅ SUCCESS! User % (ID: %) has been granted admin role', v_email, v_user_id;
  END IF;
END $$;

-- Verify the admin role assignment
SELECT 
  u.id as user_id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ Admin Access Granted'
    ELSE '❌ Not an admin'
  END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'mncubekhulekani@gmail.com';
