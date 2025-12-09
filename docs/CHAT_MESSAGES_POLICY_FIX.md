# Chat Messages INSERT Policy Fix

**Issue**: Support agents getting "Failed to send message" error when trying to reply to customer chat sessions.

**Date**: December 4, 2025

---

## Problem Analysis

### Root Cause
The original RLS policy for inserting chat messages was too restrictive:

```sql
CREATE POLICY "Users can create messages in own sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
        )
    )
);
```

### Why It Failed
The policy required BOTH conditions:
1. ✅ `auth.uid() = sender_id` (support agent is authenticated)
2. ❌ AND one of:
   - Session belongs to auth.uid() (FALSE - session belongs to customer!)
   - OR has admin/support_agent role (TRUE)

However, the logic flaw was that support agents needed to message sessions **owned by customers**, not their own sessions. The policy checked if the session belonged to the support agent, which would always be false.

---

## Solution

### New Policy Logic
Split the logic by sender type:

```sql
CREATE POLICY "Users and support agents can create messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        -- Regular users can message their own sessions
        (
            sender_type = 'customer'
            AND EXISTS (
                SELECT 1 FROM public.chat_sessions
                WHERE id = session_id AND user_id = auth.uid()
            )
        )
        -- Support agents can message ANY session
        OR
        (
            sender_type = 'support_agent'
            AND EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
            )
        )
    )
);
```

### Key Changes
1. **Explicitly checks `sender_type`** to differentiate between customers and support agents
2. **Customers** must message their own sessions (session.user_id = auth.uid())
3. **Support agents** can message ANY session (no session ownership check)
4. Both types still require `auth.uid() = sender_id` for security

---

## Deployment Steps

### Step 1: Apply the Fix Migration
```bash
# Navigate to Supabase Dashboard > SQL Editor
# Run the migration file:
supabase/migrations/20251204000002_fix_chat_messages_insert_policy.sql
```

Or via Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Deployment
Run the test file in SQL Editor:
```sql
-- File: supabase/migrations/test_chat_messages_policy_fix.sql
```

Expected results:
- ✅ New policy "Users and support agents can create messages" exists
- ✅ Policy allows INSERT operation
- ✅ 3 total policies on chat_messages table

### Step 3: Test in Application
1. Navigate to `http://localhost:8080/admin/support-console`
2. Click on a customer chat session
3. Type a test message
4. Click "Send" button
5. **Expected**: ✅ Message sent successfully (no error toast)

---

## Security Implications

### What This Fixes
- ✅ Support agents can now reply to customer chat sessions
- ✅ Customers can still only message their own sessions
- ✅ Maintains authentication requirements (`auth.uid() = sender_id`)
- ✅ Validates role membership in user_roles table

### What This Prevents
- ❌ Users cannot impersonate others (sender_id must match auth.uid())
- ❌ Customers cannot message sessions they don't own
- ❌ Non-support users cannot send messages as 'support_agent'
- ❌ Unauthorized users cannot bypass role checks

### Audit Trail
All messages still have:
- `sender_id` - Who sent it
- `sender_type` - Their role type
- `session_id` - Which conversation
- `created_at` - When sent
- `is_internal` - Visibility flag

---

## Troubleshooting

### Issue: Still getting "Failed to send message"

**Check 1: User has support_agent role**
```sql
SELECT user_id, role 
FROM public.user_roles 
WHERE user_id = auth.uid() 
AND role IN ('admin', 'support_agent');
```

**Check 2: Policy is deployed**
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'chat_messages' 
AND policyname = 'Users and support agents can create messages';
```

**Check 3: Check browser console**
- Open DevTools (F12)
- Look for red errors in Console tab
- Common errors:
  - "new row violates row-level security policy" → Role not assigned
  - "permission denied" → Policy not deployed
  - "sender_type must be customer or support_agent" → Check constraint

---

## Related Files

### Migration Files
- `20251204000000_live_chat_support_system.sql` - Original system (has old policy)
- `20251204000002_fix_chat_messages_insert_policy.sql` - Fix migration (NEW)

### Test Files
- `test_live_chat_deployment.sql` - Full deployment verification
- `test_chat_messages_policy_fix.sql` - Policy-specific tests

### Application Files
- `src/pages/AdminSupportConsole.tsx` - Support agent interface (line ~275 sendMessage)
- `src/pages/LiveChatSupport.tsx` - Customer interface
- `src/pages/CustomerSupport.tsx` - Customer support page

---

## Validation Checklist

- [ ] Migration file deployed to Supabase
- [ ] New policy appears in pg_policies table
- [ ] Old policy removed from chat_messages table
- [ ] Support agent role assigned to test user
- [ ] Can send message from admin console without error
- [ ] Customer can still send messages to own session
- [ ] Browser console shows no RLS errors
- [ ] Message appears in chat thread immediately

---

## Prevention for Future

### Policy Design Pattern
When creating RLS policies for multi-role systems:

1. **Identify all actor types** (customer, support_agent, admin)
2. **Define permissions per type** (what can each do?)
3. **Use OR conditions** to separate type-specific logic
4. **Test each role independently** before deploying

### Code Review Checklist
- [ ] Does policy check `sender_type` or equivalent?
- [ ] Can support roles access resources they don't own?
- [ ] Are there separate paths for customers vs staff?
- [ ] Did we test with a user having the exact role?

---

## Rollback Plan

If issues arise, rollback to original policy:

```sql
DROP POLICY IF EXISTS "Users and support agents can create messages" ON public.chat_messages;

CREATE POLICY "Users can create messages in own sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'support_agent')
        )
    )
);
```

**Note**: This will restore the bug. Only use as emergency measure.

---

## Success Metrics

After deployment, verify:
- ✅ Zero "Failed to send message" errors in admin console
- ✅ Support agents can respond to 100% of customer chats
- ✅ Customers can still send messages without issues
- ✅ No RLS policy violations in Supabase logs
- ✅ Message delivery latency < 1 second

---

**Status**: 🟢 Ready to Deploy  
**Priority**: High (Blocking feature)  
**Impact**: Support agents currently cannot respond to customers
