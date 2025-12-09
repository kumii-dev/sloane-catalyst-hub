# Role Management Guide

## Overview
The User Management page at `http://localhost:8080/admin/users` now supports comprehensive role management for all platform roles.

## Available Roles

### Administrative Roles
- **Admin** (`admin`) - Full system administrator access
- **Support Agent** (`support_agent`) - Customer support and live chat access
- **Mentorship Admin** (`mentorship_admin`) - Mentorship program management access

### User Roles
- **Mentor** (`mentor`) - Mentorship program mentor
- **Advisor** (`advisor`) - Business advisor
- **Funder** (`funder`) - Funding provider
- **Startup** (`startup`) - Startup founder/team member
- **SMME** (`smme`) - Small, Medium, Micro Enterprise
- **Service Provider** (`service_provider`) - Service provider
- **Software Provider** (`software_provider`) - Software/technology provider
- **Learning Provider** (`learning_provider`) - Education/training provider

## How to Grant Roles

### Via Admin Users Page
1. Navigate to `http://localhost:8080/admin/users`
2. Click on the "Admin Management" tab
3. Select the desired role from the "Role Type" dropdown
4. Enter the user's email address
5. Click "Grant Access"

### Role Selection Options
The role dropdown includes all 11 platform roles:
- Full Admin
- Support Agent ⭐ NEW
- Mentorship Admin
- Mentor
- Advisor
- Funder
- Startup
- SMME
- Service Provider
- Software Provider
- Learning Provider

## How to Revoke Roles

### Individual Role Revocation
1. Navigate to `http://localhost:8080/admin/users`
2. Find the user in the "All Users" list
3. In the "Roles" column, hover over the role badge
4. Click the "×" button that appears
5. Confirm the revocation in the dialog

### Features
- **Hover to Reveal**: Role badges show a remove button (×) on hover
- **Confirmation Dialog**: Prevents accidental revocations
- **Toast Notifications**: Success/error feedback after each action
- **Real-time Updates**: User list refreshes automatically after changes

## Statistics Dashboard

The overview section displays role counts:
- **Total Users**: All registered users
- **Active Users**: Currently enabled users
- **Disabled Users**: Currently disabled users
- **Admins**: Users with admin role
- **Support Agents**: Users with support_agent role ⭐ NEW
- **Mentorship Admins**: Users with mentorship_admin role ⭐ NEW
- **Startups**: Users with startup persona
- **Mentors**: Users with mentor persona
- **Providers**: Users with service_provider persona
- **Funders**: Users with funder persona

## Support Agent Access

Users with the `support_agent` role can access:
- **Admin Support Console**: `http://localhost:8080/admin/support-console`
  - View all active chat sessions
  - Respond to customer inquiries
  - Assign sessions to themselves
  - Mark sessions as resolved or closed

### Granting Support Agent Access
To enable someone to access the Admin Support Console:
1. Go to `http://localhost:8080/admin/users`
2. Select "Support Agent" from role dropdown
3. Enter their email
4. Click "Grant Access"
5. They can now access `/admin/support-console`

## Access Control

### Prerequisites
- Only users with `admin` role can access the User Management page
- Only `admin` and `support_agent` roles can access the Admin Support Console
- Role checks happen at both the UI and database (RLS policies) level

### Role Verification
When a user tries to access restricted pages:
1. System checks their roles in the `user_roles` table
2. If authorized, access is granted
3. If unauthorized, they see "Access denied" toast and are redirected

## Database Schema

### user_roles Table
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);
```

### app_role Enum
```sql
CREATE TYPE app_role AS ENUM (
  'admin',
  'startup',
  'smme',
  'mentor',
  'advisor',
  'funder',
  'service_provider',
  'software_provider',
  'software_provider_pending',
  'mentorship_admin',
  'learning_provider',
  'support_agent'  -- Added in migration 20251202000000
);
```

## Deployment Checklist

### 1. Database Migration
Ensure migration `20251202000000_add_support_agent_role.sql` has been applied:
```sql
-- Check if support_agent role exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'app_role'::regtype;
```

If `support_agent` is missing, run:
```sql
ALTER TYPE app_role ADD VALUE 'support_agent';
```

### 2. TypeScript Types
The types have been updated in:
- `src/integrations/supabase/types.ts` - Added `support_agent` to enum

### 3. UI Components
Updated files:
- `src/pages/admin/UserManagement.tsx` - Full role management
- `src/pages/AdminSupportConsole.tsx` - Support agent access control

## Usage Examples

### Example 1: Grant Support Agent Access
```typescript
// Admin grants Jane support agent access
1. Open http://localhost:8080/admin/users
2. Select "Support Agent" from dropdown
3. Enter "jane@example.com"
4. Click "Grant Access"
// Jane can now access /admin/support-console
```

### Example 2: Revoke Specific Role
```typescript
// Admin revokes John's mentor role but keeps his advisor role
1. Find John in user list
2. Hover over "mentor" badge
3. Click "×" button
4. Confirm revocation
// John still has advisor role, only mentor removed
```

### Example 3: Multi-Role User
```typescript
// A user can have multiple roles simultaneously
User: sarah@example.com
Roles: ['admin', 'mentor', 'support_agent']
// Sarah can:
// - Manage users (admin)
// - Provide mentorship (mentor)
// - Answer support chats (support_agent)
```

## Troubleshooting

### Issue: "User already has X role"
**Cause**: Trying to grant a role the user already has
**Solution**: Check the user's current roles in the table before granting

### Issue: Access denied to support console
**Cause**: User doesn't have `admin` or `support_agent` role
**Solution**: Grant `support_agent` role via User Management page

### Issue: Role dropdown shows old roles
**Cause**: Browser cache or TypeScript types not regenerated
**Solution**: 
1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Verify database migration applied

### Issue: Can't revoke last admin role
**Cause**: Platform requires at least one admin
**Solution**: Add another admin first, then revoke

## Security Considerations

### Role-Based Access Control (RBAC)
- All role checks happen at database level via RLS policies
- UI restrictions are a convenience, not security
- Never trust client-side role checks alone

### Audit Trail
All role changes should be logged:
- Who granted/revoked the role
- When it was changed
- What role was affected

Consider implementing:
```sql
CREATE TABLE role_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role app_role,
  action TEXT, -- 'granted' or 'revoked'
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP DEFAULT NOW()
);
```

## Future Enhancements

### Potential Features
1. **Role Templates**: Pre-defined role combinations
2. **Temporary Roles**: Roles with expiration dates
3. **Role Hierarchy**: Inherit permissions from other roles
4. **Bulk Operations**: Grant/revoke roles for multiple users
5. **Role History**: View complete role change history per user
6. **Permission Matrix**: Visual permission breakdown per role
7. **Role Requests**: Users can request roles, admins approve

### Integration Opportunities
- Connect to identity providers (OAuth, SAML)
- Sync roles with external systems
- Automated role assignment based on criteria
- Role-based content filtering

## Support

For issues or questions:
- Check database logs for RLS policy violations
- Verify user has correct roles in `user_roles` table
- Test role access with different user accounts
- Review Supabase dashboard for real-time insights

Last Updated: December 4, 2025
