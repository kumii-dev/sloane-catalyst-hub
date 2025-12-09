# Sender Type Constraint Fix

**Issue**: "Failed to send message" - CHECK constraint violation

**Root Cause**: The `chat_messages` table has a CHECK constraint that only allows sender_type values: `'customer'`, `'agent'`, `'system'`, `'bot'`. But the frontend code sends `'support_agent'`, which is **not allowed**.

---

## The Actual Error

```
ERROR: new row for relation "chat_messages" violates check constraint "chat_messages_sender_type_check"
DETAIL: Failing row contains (..., support_agent, ...)
```

This was hidden by the generic "Failed to send message" toast.

---

## Root Cause

### Database Schema (Line 119 of migration)
```sql
sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system', 'bot'))
```
❌ Does NOT include `'support_agent'`

### Frontend Code (AdminSupportConsole.tsx Line 277)
```typescript
const { error } = await supabase
  .from('chat_messages')
  .insert({
    sender_type: 'support_agent',  // ❌ Not allowed by constraint!
    ...
  });
```

---

## Solution

Add `'support_agent'` to the allowed values in the CHECK constraint:

```sql
ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_type_check 
CHECK (sender_type IN ('customer', 'agent', 'support_agent', 'system', 'bot'));
```

Also update the RLS policy to accept both `'agent'` and `'support_agent'`.

---

## Deployment

### Step 1: Apply Migration
Run this in Supabase SQL Editor:
```
supabase/migrations/20251204000003_fix_sender_type_constraint.sql
```

### Step 2: Verify
```sql
-- Check the new constraint
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.chat_messages'::regclass
AND conname = 'chat_messages_sender_type_check';
```

Should show: `CHECK (sender_type IN ('customer', 'agent', 'support_agent', 'system', 'bot'))`

### Step 3: Test
1. Go to `http://localhost:8080/admin/support-console`
2. Send a test message
3. Expected: ✅ "Message sent" success

---

## Why This Happened

1. ✅ Original migration created constraint with 4 values
2. ✅ Frontend code evolved to use 'support_agent' 
3. ❌ Migration was never updated
4. ❌ Constraint validation prevented INSERT

---

## Timeline of Fixes

| Fix # | Issue | Solution |
|-------|-------|----------|
| #1 | Authentication redirect | Removed `.single()` from auth check |
| #2 | Missing RLS policy | Added INSERT policy for chat_session_activity |
| #3 | RLS too restrictive | Updated policy to allow support agents ANY session |
| #4 | **CHECK constraint** | **Added 'support_agent' to allowed values** |

---

## Testing Checklist

After deploying this fix:

- [ ] Migration runs without errors
- [ ] CHECK constraint includes 'support_agent'
- [ ] RLS policy accepts 'agent' and 'support_agent'
- [ ] Can send message from admin console
- [ ] Message appears in chat thread
- [ ] No console errors
- [ ] Customer can still send messages

---

**Status**: 🔴 Critical - Blocking support agent functionality  
**Priority**: P0 - Deploy immediately
