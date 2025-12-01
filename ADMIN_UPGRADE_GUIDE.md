# 👤 Admin User Upgrade Guide

**User to Upgrade**: mncubekhulekani@gmail.com  
**Role**: Admin  
**Date**: December 1, 2025

---

## 🚀 Quick Method (Recommended)

### Step 1: Open Supabase SQL Editor
Go to your Supabase Dashboard SQL Editor:
```
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor
```

### Step 2: Run the Quick Script
1. Click "SQL Editor" in the left sidebar
2. Click "+ New query"
3. Copy the contents of `grant_admin_quick.sql`
4. Paste into the editor
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify Results
You should see:
- ✅ A success message in the Messages panel
- ✅ A result table showing the user with admin role
- ✅ Status: "✅ Admin Access Granted"

---

## 📋 Alternative: Step-by-Step Method

If the quick script doesn't work, use this manual approach:

### Step 1: Find the User ID
Run this query in SQL Editor:
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'mncubekhulekani@gmail.com';
```

**Expected Result**: One row with user details  
**Copy the `id` value** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Grant Admin Role
Replace `USER_ID_HERE` with the copied ID and run:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify
Run this to confirm:
```sql
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'mncubekhulekani@gmail.com';
```

**Expected Result**: User should have `role = 'admin'`

---

## ⚠️ Troubleshooting

### Issue: "User not found"
**Possible Causes**:
- User hasn't signed up yet
- Email misspelled
- User signed up with different email

**Solution**:
1. Check if user exists:
   ```sql
   SELECT email FROM auth.users WHERE email ILIKE '%mncube%';
   ```
2. Ask user to sign up first if they haven't
3. Verify exact email spelling

### Issue: "Table user_roles does not exist"
**Possible Cause**: Database schema missing user_roles table

**Solution**: Create the table first:
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
);

-- If false, create it:
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mentorship_admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
```

### Issue: "Permission denied"
**Cause**: Insufficient database permissions

**Solution**: 
- Make sure you're using the Supabase Dashboard (which uses service role)
- Don't try to run these queries from the application frontend

---

## ✅ Verification Checklist

After running the upgrade script:

- [ ] User appears in query results
- [ ] Role column shows "admin"
- [ ] role_assigned_at has current timestamp
- [ ] No error messages in SQL Editor

### Test Admin Access

1. **Have the user log in** to the application
2. **Check if admin features are visible**:
   - Go to: http://localhost:8080/admin
   - Should see Admin Dashboard
   - Should be able to:
     - View all users
     - Approve/reject mentors
     - Approve/reject service providers
     - View analytics
     - Access admin-only pages

3. **Verify in code**:
   The `useAuth` hook should recognize admin role:
   ```typescript
   const { user, hasRole } = useAuth();
   console.log('Is Admin:', hasRole('admin')); // Should be true
   ```

---

## 🔐 Understanding Admin Roles

Your application has these role types (from `app_role` enum):

1. **admin** - Full system access
2. **mentorship_admin** - Can manage mentors and mentorship
3. **user** - Standard user (default)

The admin role grants access to:
- `/admin` - Admin Dashboard
- `/admin/*` - All admin pages
- RLS policies that check `has_role(auth.uid(), 'admin')`
- Administrative Edge Functions

---

## 📊 Check All Admins

To see all users with admin role:
```sql
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  ur.role,
  ur.created_at as role_assigned
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

---

## 🔄 Revoke Admin Access (If Needed)

To remove admin role from a user:
```sql
DELETE FROM public.user_roles
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'mncubekhulekani@gmail.com'
)
AND role = 'admin';
```

---

## 📝 Notes

- **Security**: Only grant admin access to trusted users
- **Audit**: Admin actions should be logged in `audit_logs` table
- **Testing**: Test admin features after granting role
- **Documentation**: Keep record of who has admin access
- **Production**: Use same process for production database

---

## 🎯 Summary

**Files Created**:
1. `grant_admin_quick.sql` - Ready-to-run script
2. `upgrade_admin_user.sql` - Step-by-step version
3. This guide - Complete documentation

**Next Steps**:
1. Run `grant_admin_quick.sql` in Supabase SQL Editor
2. Verify user has admin role
3. Test admin access in application
4. Document the change

**Quick Access**: 
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor

---

**Ready to proceed?** Copy `grant_admin_quick.sql` and run it in the SQL Editor! 🚀
