-- Script to Upgrade User to Admin
-- User: mncubekhulekani@gmail.com
-- Date: December 1, 2025

-- Step 1: Find the user ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'mncubekhulekani@gmail.com';

-- Note: Copy the user ID from the result above, then use it in Step 2

-- Step 2: Grant admin role to the user
-- Replace 'USER_ID_HERE' with the actual UUID from Step 1
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the admin role was assigned
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'mncubekhulekani@gmail.com';

-- Expected result: Should show 'admin' in the role column

-- Alternative: If you want to assign admin role directly with known user_id
-- (Run this query first to get the user_id, then uncomment and run the INSERT below)

-- Get user_id:
-- SELECT id FROM auth.users WHERE email = 'mncubekhulekani@gmail.com';

-- Then run (replace the UUID):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('paste-user-id-here', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
