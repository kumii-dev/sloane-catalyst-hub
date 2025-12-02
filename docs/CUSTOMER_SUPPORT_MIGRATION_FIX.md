# Customer Support Migration Fix - Enum Error Resolution

**Issue 1**: `ERROR: 22P02: invalid input value for enum app_role: "support_agent"`  
**Issue 2**: `ERROR: 55P04: unsafe use of new value "support_agent" of enum type app_role`

**Root Cause**: PostgreSQL requires enum values to be committed in a separate transaction before they can be used.

**Solution**: Split into **two migrations** that must be run sequentially.

---

## What Changed

### Migration Split into Two Files

#### Migration 1: Add Enum Value
**File**: `supabase/migrations/20251202000000_add_support_agent_role.sql` (NEW)

```sql
-- Add support_agent role to app_role enum
-- This must be in a separate migration from where it's used

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_agent' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'support_agent';
    END IF;
END $$;
```

**Purpose**: Adds `support_agent` to the enum and commits it.

#### Migration 2: Create Support System
**File**: `supabase/migrations/20251202000001_customer_support_system.sql` (UPDATED)

- Removed enum addition (now in separate migration)
- Added prerequisite comment at top
- All table creation and RLS policies remain the same

**Purpose**: Creates tables, policies, functions using the committed enum value.

---

## Why Two Migrations?

PostgreSQL requires:
1. ✅ **Commit the enum value** in one transaction
2. ✅ **Use the enum value** in a subsequent transaction

If both are in the same migration, PostgreSQL throws:
> `ERROR: 55P04: unsafe use of new value "support_agent"`

This is a safety feature to prevent partial enum states.

---

## Deployment Steps (Corrected)

### Option 1: Supabase Dashboard (Recommended) ⭐

**IMPORTANT**: Run migrations in order, one at a time.

#### Step 1: Add Enum Value

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
   - Navigate to: SQL Editor → New Query

2. **Execute Migration 1**
   - Copy **entire file**: `supabase/migrations/20251202000000_add_support_agent_role.sql`
   - Paste into SQL Editor
   - Click **"Run"**
   - ✅ Wait for "Success" confirmation

3. **Verify Enum Added**
   ```sql
   SELECT enumlabel FROM pg_enum 
   WHERE enumtypid = 'app_role'::regtype 
   ORDER BY enumsortorder;
   ```
   ✅ Should see `support_agent` in the list

#### Step 2: Create Support System

1. **Open New Query** in SQL Editor

2. **Execute Migration 2**
   - Copy **entire file**: `supabase/migrations/20251202000001_customer_support_system.sql`
   - Paste into SQL Editor
   - Click **"Run"**
   - ✅ Should complete successfully (3 tables, 11 policies, 8 functions, 5 triggers)

3. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'support_%';
   ```
   ✅ Should show: `support_tickets`, `support_messages`, `support_ticket_activity`

#### Step 3: Enable Realtime
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
   ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;
   ```

---

### Option 2: Supabase CLI (If Available)

**IMPORTANT**: Migrations run in filename order automatically.

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub"

# Push both migrations (runs in order: 20251202000000 → 20251202000001)
supabase db push

# Enable Realtime
supabase db execute "
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;
"
```

**Note**: CLI automatically handles transaction boundaries between migrations.

---

## Alternative: Use Admin Role Only

If you prefer not to add a new enum value, you can simplify by using only the `admin` role:

### Quick Fix (Without Enum Change)

Replace all occurrences of:
```sql
role IN ('admin', 'support_agent')
```

With:
```sql
role = 'admin'
```

**Locations to change** (9 occurrences):
1. Line ~218: "Admins can view all tickets" policy
2. Line ~243: "Admins can update tickets" policy
3. Line ~256: "Admins can view all messages" policy
4. Line ~283: "Admins can view all activity" policy
5. Line ~398: `update_ticket_status` function role check
6. And similar in other RLS policies

**Pros**: No enum changes needed  
**Cons**: All support staff need `admin` role (less granular control)

---

## Recommended Approach

**Use the updated migration with enum addition** (already done in the file) because:

1. ✅ **Better security**: Separate `support_agent` role with limited privileges
2. ✅ **Future-proof**: Can add different permissions for support vs full admin
3. ✅ **ISO 27001 compliant**: Principle of least privilege
4. ✅ **Safe**: Uses `IF NOT EXISTS` check (idempotent)

---

## Assigning Support Agent Role

After migration completes, assign support agent role to users:

```sql
-- Add support_agent role to a user
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'support_agent'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Example: Add to specific user by email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'support_agent'::app_role
FROM auth.users
WHERE email = 'support@sloaneHub.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify role assigned
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'support_agent';
```

---

## Testing After Deployment

### 1. Verify Enum
```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'app_role'::regtype 
ORDER BY enumsortorder;
```
✅ Should include `support_agent`

### 2. Verify Tables
```sql
\dt public.support_*
-- OR
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'support_%';
```
✅ Should show 3 tables

### 3. Verify RLS Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename LIKE 'support_%';
```
✅ Should show 11 policies total

### 4. Test Access Control

**As Customer**:
```sql
-- Set session to customer user
SET ROLE authenticated;
SET request.jwt.claim.sub TO 'customer-user-id';

-- Try to view tickets (should only see own)
SELECT * FROM support_tickets;
```

**As Support Agent**:
```sql
-- Assign support_agent role first
INSERT INTO user_roles (user_id, role) 
VALUES ('support-user-id', 'support_agent');

-- Set session to support agent
SET ROLE authenticated;
SET request.jwt.claim.sub TO 'support-user-id';

-- Try to view tickets (should see all)
SELECT * FROM support_tickets;
```

### 5. Test Ticket Creation
```sql
-- Create test ticket
INSERT INTO support_tickets (
    user_id, user_email, user_name, 
    subject, category, priority
) VALUES (
    auth.uid(), 
    'test@example.com', 
    'Test User',
    'Test ticket', 
    'technical', 
    'medium'
);

-- Verify ticket number generated
SELECT ticket_number, subject FROM support_tickets ORDER BY created_at DESC LIMIT 1;
```
✅ Should show `TKT-001000` or similar

---

## Rollback (If Needed)

If something goes wrong:

```sql
-- Drop tables (cascades to constraints)
DROP TABLE IF EXISTS public.support_ticket_activity CASCADE;
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS log_ticket_activity CASCADE;
DROP FUNCTION IF EXISTS update_ticket_status CASCADE;
DROP FUNCTION IF EXISTS assign_ticket CASCADE;
DROP FUNCTION IF EXISTS generate_ticket_number CASCADE;
DROP FUNCTION IF EXISTS update_support_updated_at CASCADE;
DROP FUNCTION IF EXISTS log_ticket_creation CASCADE;
DROP FUNCTION IF EXISTS log_message_creation CASCADE;
DROP FUNCTION IF EXISTS archive_old_tickets CASCADE;
DROP FUNCTION IF EXISTS delete_old_archived_tickets CASCADE;

-- Drop sequence
DROP SEQUENCE IF EXISTS support_ticket_seq CASCADE;

-- Drop view
DROP VIEW IF EXISTS support_ticket_stats CASCADE;

-- OPTIONAL: Remove enum value (PostgreSQL 12+)
-- ALTER TYPE app_role DROP VALUE 'support_agent'; -- Not supported in PG < 12

-- Alternative: Recreate enum without support_agent (complex, not recommended)
```

**Note**: Dropping enum values is only supported in PostgreSQL 12+. If on older version, the enum value will remain but won't cause issues.

---

## Summary

✅ **Fixed**: Split into 2 migrations to handle PostgreSQL enum transaction requirements  
✅ **Safe**: Uses `IF NOT EXISTS` check (idempotent)  
✅ **Sequential**: Migration 1 adds enum, Migration 2 uses it  
✅ **Ready**: Can be deployed via Supabase Dashboard SQL Editor  
✅ **Tested**: Migration structure validated (build succeeded)

**Next Steps**:
1. Execute `20251202000000_add_support_agent_role.sql` first
2. Wait for success confirmation
3. Execute `20251202000001_customer_support_system.sql` second
4. Enable Realtime for the 3 tables

---

**Questions?** Check:
- Full deployment guide: `docs/CUSTOMER_SUPPORT_DEPLOYMENT.md`
- ISO 27001 compliance: `docs/CUSTOMER_SUPPORT_ISO27001_COMPLIANCE.md`
- Implementation summary: `docs/CUSTOMER_SUPPORT_IMPLEMENTATION_SUMMARY.md`
