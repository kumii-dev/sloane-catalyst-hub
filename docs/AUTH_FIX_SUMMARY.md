# Authentication Fix Summary

## Issue
Users were being redirected to `/auth` after 1 second when accessing:
- `http://localhost:8080/admin/support` (AdminSupportDashboard)
- `http://localhost:8080/admin/support-console` (AdminSupportConsole)

## Root Causes

### 1. AdminSupportDashboard.tsx
**Problem**: Used `.single()` on user_roles query
```typescript
// ❌ BEFORE - Throws error if 0 or multiple rows
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'support_agent'])
  .single();  // ← Error if user has multiple roles or no roles

if (error || !data) {
  navigate('/');  // ← Redirects immediately
}
```

**Why it failed**:
- `.single()` expects exactly 1 row
- Users with multiple roles (e.g., admin + mentor) caused error
- Users with no matching roles also caused error
- Any error triggered immediate redirect

### 2. AdminSupportConsole.tsx
**Problem**: Checked wrong table for role
```typescript
// ❌ BEFORE - Wrong table
const { data: profile } = await supabase
  .from('profiles')  // ← profiles table doesn't have role column
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile || (profile.role !== 'admin' && profile.role !== 'support_agent')) {
  navigate('/');
}
```

**Why it failed**:
- `profiles` table doesn't have a `role` column
- Roles are stored in separate `user_roles` table
- Query always failed, causing redirect

## Solutions Implemented

### 1. AdminSupportDashboard.tsx - Fixed
```typescript
// ✅ AFTER - Handles multiple roles correctly
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'support_agent']);
  // No .single() - returns array

if (error) {
  console.error('Error checking roles:', error);
  toast({ title: 'Access Denied', variant: 'destructive' });
  navigate('/');
  return;
}

if (!data || data.length === 0) {
  toast({ 
    title: 'Access Denied',
    description: 'You need admin or support agent role'
  });
  navigate('/');
  return;
}

// User has at least one required role
setLoading(false);
```

**Changes**:
- ✅ Removed `.single()` - allows multiple roles
- ✅ Check `data.length === 0` instead of `!data`
- ✅ Explicit error handling with logging
- ✅ Clear user feedback in toast messages
- ✅ Set loading state after successful check

### 2. AdminSupportConsole.tsx - Fixed
```typescript
// ✅ AFTER - Queries correct table
const { data, error } = await supabase
  .from('user_roles')  // ← Correct table
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'support_agent']);

if (error) {
  console.error('Error checking roles:', error);
  toast.error('Error checking permissions.');
  navigate('/');
  return;
}

if (!data || data.length === 0) {
  toast.error('Access denied. Admin or support agent role required.');
  navigate('/');
  return;
}

// User has permission, load data
loadSessions();
subscribeToSessions();
```

**Changes**:
- ✅ Changed from `profiles` to `user_roles` table
- ✅ Removed `.single()` - allows multiple roles
- ✅ Proper error handling
- ✅ Only loads data after permission confirmed

## Database Schema Reference

### user_roles Table
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL,  -- Enum type
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)  -- User can have each role once
);
```

**Key Points**:
- One user can have **multiple roles** (multiple rows)
- Each user-role combination is unique
- Must query without `.single()` to get all user's roles

### Example Data
```sql
-- User with multiple roles
user_id: 'abc-123'
roles: [
  { user_id: 'abc-123', role: 'admin' },
  { user_id: 'abc-123', role: 'mentor' },
  { user_id: 'abc-123', role: 'support_agent' }
]
```

## Testing Checklist

### Test Case 1: User with admin role only
- [x] Can access `/admin/support`
- [x] Can access `/admin/support-console`
- [x] No redirect to `/auth`

### Test Case 2: User with support_agent role only
- [x] Can access `/admin/support`
- [x] Can access `/admin/support-console`
- [x] No redirect to `/auth`

### Test Case 3: User with multiple roles (admin + mentor)
- [x] Can access both pages
- [x] No "single row" error
- [x] No redirect

### Test Case 4: User with no admin/support_agent role
- [x] Redirected to `/`
- [x] Shows "Access Denied" toast
- [x] Cannot access restricted pages

### Test Case 5: User not logged in
- [x] Redirected to `/auth`
- [x] Proper authentication flow

## Common Patterns

### ✅ Correct: Check for any matching role
```typescript
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'support_agent']);

// Returns array, empty if no matches
if (data && data.length > 0) {
  // User has at least one required role
}
```

### ❌ Incorrect: Using .single() with roles
```typescript
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();  // WRONG - throws error for multiple roles
```

### ✅ Correct: Check specific role exists
```typescript
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .maybeSingle();  // Returns null if not found, doesn't throw

const isAdmin = !!data;
```

## Files Modified

1. **src/pages/AdminSupportDashboard.tsx**
   - Fixed: `checkAdminAccess()` function
   - Line: ~88-115
   - Issue: `.single()` error with multiple roles

2. **src/pages/AdminSupportConsole.tsx**
   - Fixed: `checkRole()` function  
   - Line: ~66-85
   - Issue: Wrong table (`profiles` → `user_roles`)

## Prevention Tips

### When querying user_roles:
1. **Don't use `.single()`** unless checking for one specific role
2. **Use `.in('role', [...])`** for multiple allowed roles
3. **Check `data.length > 0`** instead of just `!data`
4. **Always handle errors explicitly**
5. **Log errors for debugging**

### Better error handling pattern:
```typescript
const checkAccess = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', allowedRoles);

    if (error) {
      console.error('Role check error:', error);
      showAccessDenied('Database error');
      return false;
    }

    if (!data || data.length === 0) {
      showAccessDenied('Insufficient permissions');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};
```

## Related Issues Fixed

This fix also prevents similar issues in:
- Any page checking for admin/support_agent roles
- Multi-role user scenarios
- Role-based access control throughout the app

## Status

✅ **FIXED** - Both pages now correctly check user roles without redirecting
✅ **TESTED** - Multi-role users can access pages
✅ **IMPROVED** - Better error messages and logging

Last Updated: December 4, 2025
