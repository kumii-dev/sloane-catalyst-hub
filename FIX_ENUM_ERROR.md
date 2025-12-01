# 🔧 Fix: Enum Value Error

## The Problem
PostgreSQL requires enum values to be committed in a separate transaction before they can be used. The error occurs because we're trying to:
1. Add `mentorship_admin` to the `app_role` enum
2. Use it immediately in policies

These must be done in **two separate transactions**.

---

## ✅ Solution: Apply Migrations in 2 Parts

### Part 1: Add Enum Value (248 lines)
**File**: `remaining_migrations_part1_full.sql`

This includes:
- All migrations up to and including adding the `mentorship_admin` enum value
- Migrations: `20251027115220` through `20251028090849`

### Part 2: Use Enum Value (674 lines)  
**File**: `remaining_migrations_part2_full.sql`

This includes:
- All migrations that USE the `mentorship_admin` enum
- Migrations: `20251028090931` through `20251125111816`

---

## 📝 Step-by-Step Instructions

### Step 1: Apply Part 1

1. Open `remaining_migrations_part1_full.sql`
2. Copy all content (Cmd+A, Cmd+C)
3. Go to SQL Editor: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor
4. Paste and click "Run"
5. **Wait for it to complete successfully** ✅

### Step 2: Apply Part 2

1. **IMPORTANT**: Only after Part 1 succeeds
2. Open `remaining_migrations_part2_full.sql`  
3. Copy all content (Cmd+A, Cmd+C)
4. Go to SQL Editor (new query)
5. Paste and click "Run"
6. Done! ✅

---

## 🎯 What's in Each Part

### Part 1 (9 migrations):
1. ✅ Remove seed data (already done)
2. ✅ Delete pending provider applications  
3. ✅ Allow withdrawal of pending applications
4. ✅ Add contact_person column
5. ✅ Add provider RLS policies
6. ✅ Admin RLS for registrations
7. ✅ Add is_active to profiles
8. ✅ **Add mentorship_admin enum** ⬅️ Must commit here
9. ✅ Add is_active column

### Part 2 (10 migrations):
10. ✅ Email cohort mappings (uses enum)
11. ✅ Update service banner
12. ✅ Cohort funded listings policy
13. ✅ Match generation triggers
14. ✅ Advisors system (new tables)
15. ✅ Advisor admin policies
16. ✅ Audit logs (security)
17. ✅ Saved searches for funders
18. ✅ Platform documents storage
19. ✅ Newsletter subscriptions
20. ✅ Status notifications

---

## 🔍 Verification After Both Parts

Run this query to verify all migrations applied:

```sql
-- Should return 20251125111816
SELECT version 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 1;

-- Should show mentorship_admin exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'app_role'::regtype 
ORDER BY enumlabel;
```

---

## 🚨 If Part 1 Fails

Check which specific migration failed and:
1. Note the migration number
2. Open that file in `supabase/migrations/`
3. Run it individually
4. Continue with next migration

Common issues:
- **Policy already exists**: Safe to ignore (DROP IF EXISTS handles this)
- **Column already exists**: Safe to ignore (IF NOT EXISTS handles this)
- **Function already exists**: Safe to ignore (CREATE OR REPLACE handles this)

---

## ✨ After Successful Completion

Your database will have:
- ✅ All 19 remaining migrations applied
- ✅ Mentorship admin role system
- ✅ Advisors system (separate from mentors)
- ✅ Email-based cohort assignment
- ✅ Audit logging
- ✅ Platform documents
- ✅ Newsletter & status notifications

Then proceed with:
1. Update `.env` with new project credentials
2. Test your application
3. Copy storage buckets
4. Configure authentication

---

## 📁 Files Summary

- ✅ `remaining_migrations_part1_full.sql` - **Run 1st** (248 lines)
- ✅ `remaining_migrations_part2_full.sql` - **Run 2nd** (674 lines)
- 📋 `remaining_migrations_list.txt` - Migration list reference
- 📖 `FIX_ENUM_ERROR.md` - This guide

---

**Last Updated**: November 30, 2025  
**Status**: Ready to apply in 2 parts
