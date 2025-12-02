# Customer Support System - Quick Deployment Checklist

**Date**: December 2, 2025  
**Status**: Ready for Deployment

---

## ✅ Pre-Deployment Checklist

- [x] Database migration files created (2 files)
- [x] Frontend components built (CustomerSupport, AdminSupportDashboard)
- [x] Routes configured in App.tsx
- [x] Navigation integrated (AppSidebar, AdminDashboard)
- [x] TypeScript compilation verified (no errors)
- [x] Build successful (npm run build)
- [x] Documentation complete (4 docs)
- [x] Enum transaction issue resolved (split migrations)

---

## 🚀 Deployment Steps

### Step 1: Add Enum Value (Migration 1)

**File**: `supabase/migrations/20251202000000_add_support_agent_role.sql`

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
2. Go to: **SQL Editor** → **New Query**
3. Copy entire file contents
4. Paste into SQL Editor
5. Click **"Run"**
6. ✅ Wait for "Success" message

**Verify**:
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'app_role'::regtype 
ORDER BY enumsortorder;
```
Expected: Should include `support_agent`

---

### Step 2: Create Support System (Migration 2)

**File**: `supabase/migrations/20251202000001_customer_support_system.sql`

1. In Supabase Dashboard: **SQL Editor** → **New Query**
2. Copy entire file contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success" message

**Verify**:
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'support_%';
```
Expected: `support_tickets`, `support_messages`, `support_ticket_activity`

```sql
-- Check RLS policies
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename LIKE 'support_%' 
GROUP BY tablename;
```
Expected: 
- support_tickets: 5 policies
- support_messages: 3 policies
- support_ticket_activity: 2 policies

```sql
-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%ticket%';
```
Expected: 8 functions

---

### Step 3: Enable Realtime

Run in SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;
```

**Verify**:
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename LIKE 'support_%';
```
Expected: 3 tables listed

---

### Step 4: Assign Support Agent Roles

Run for each support team member:

```sql
-- Replace 'user-uuid-here' with actual user ID
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'support_agent'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
```

**Or assign by email**:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'support_agent'::app_role
FROM auth.users
WHERE email = 'support@sloaneHub.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

**Verify**:
```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'support_agent';
```

---

## 🧪 Testing Checklist

### Database Testing

- [ ] **Enum value added**
  ```sql
  SELECT 'support_agent' = ANY(enum_range(NULL::app_role)) AS exists;
  ```
  Expected: `t` (true)

- [ ] **Tables exist**
  ```sql
  SELECT EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'support_tickets');
  ```
  Expected: `t` (true)

- [ ] **RLS enabled**
  ```sql
  SELECT relname, relrowsecurity FROM pg_class 
  WHERE relname LIKE 'support_%' AND relrowsecurity = true;
  ```
  Expected: 3 tables

- [ ] **Indexes created**
  ```sql
  SELECT tablename, indexname FROM pg_indexes 
  WHERE tablename LIKE 'support_%';
  ```
  Expected: 15 indexes total

- [ ] **Triggers active**
  ```sql
  SELECT tgname, tgrelid::regclass 
  FROM pg_trigger 
  WHERE tgrelid::regclass::text LIKE 'support_%';
  ```
  Expected: 5 triggers

---

### Frontend Testing

1. **Start Dev Server**
   ```bash
   cd "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub"
   npm run dev
   ```

2. **Test User Flow**
   - [ ] Navigate to `/support`
   - [ ] Click "New Ticket"
   - [ ] Fill form (subject, category, priority, description)
   - [ ] Submit ticket
   - [ ] Verify ticket appears with TKT-XXXXXX number
   - [ ] Click ticket to open chat
   - [ ] Send message
   - [ ] Verify message appears in thread

3. **Test Admin Flow**
   - [ ] Navigate to `/admin/support`
   - [ ] Verify role check (only admin/support_agent can access)
   - [ ] Check statistics cards display
   - [ ] Filter tickets by category/priority/status
   - [ ] Click ticket to open
   - [ ] Click "Assign to Me"
   - [ ] Change status via dropdown
   - [ ] Send response message
   - [ ] Toggle "Internal note" checkbox
   - [ ] Add internal note (verify yellow highlight)

4. **Test Real-time**
   - [ ] Open user view in one browser
   - [ ] Open admin view in another browser
   - [ ] Send message from user
   - [ ] Verify appears in admin view instantly
   - [ ] Send response from admin
   - [ ] Verify appears in user view instantly

5. **Test Access Control**
   - [ ] Customer can only see own tickets
   - [ ] Admin can see all tickets
   - [ ] Internal notes hidden from customers
   - [ ] Customer cannot access `/admin/support`

---

## 📊 Post-Deployment Monitoring

### First 24 Hours

- [ ] Check `support_ticket_stats` view
  ```sql
  SELECT * FROM support_ticket_stats;
  ```

- [ ] Monitor open tickets count
  ```sql
  SELECT COUNT(*) FROM support_tickets WHERE status = 'open';
  ```

- [ ] Check for errors in Supabase logs
  - Dashboard → Logs → Filter: "error"

- [ ] Monitor real-time connections
  - Dashboard → Database → Realtime

### First Week

- [ ] Review activity logs
  ```sql
  SELECT activity_type, COUNT(*) 
  FROM support_ticket_activity 
  GROUP BY activity_type;
  ```

- [ ] Check average response time
  ```sql
  SELECT AVG(EXTRACT(EPOCH FROM (first_response - created_at))/3600) AS avg_hours
  FROM (
    SELECT 
      st.created_at,
      MIN(sm.created_at) FILTER (WHERE sm.sender_type = 'admin') AS first_response
    FROM support_tickets st
    LEFT JOIN support_messages sm ON sm.ticket_id = st.id
    GROUP BY st.id, st.created_at
  ) sub
  WHERE first_response IS NOT NULL;
  ```

- [ ] Monitor urgent tickets
  ```sql
  SELECT COUNT(*) FROM support_tickets 
  WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed');
  ```

- [ ] Review customer satisfaction
  ```sql
  SELECT 
    AVG(customer_rating) AS avg_rating,
    COUNT(*) FILTER (WHERE customer_rating IS NOT NULL) AS rated_count,
    COUNT(*) AS total_resolved
  FROM support_tickets
  WHERE status IN ('resolved', 'closed');
  ```

---

## 🔧 Troubleshooting

### Issue: Migration 1 Fails

**Error**: `role "support_agent" already exists`

**Solution**: This is OK! Enum value already added. Proceed to Migration 2.

---

### Issue: Migration 2 Fails with Enum Error

**Error**: `invalid input value for enum app_role: "support_agent"`

**Solution**: 
1. Verify Migration 1 completed successfully
2. Check enum value exists:
   ```sql
   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'app_role'::regtype;
   ```
3. If not listed, re-run Migration 1

---

### Issue: Access Denied to Admin Console

**Error**: User redirected from `/admin/support`

**Solution**:
```sql
-- Add support_agent role
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id', 'support_agent'::app_role);
```

---

### Issue: Real-time Updates Not Working

**Solution**:
```sql
-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;

-- Verify
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename LIKE 'support_%';
```

---

### Issue: Ticket Numbers Not Generating

**Solution**:
```sql
-- Check sequence exists
SELECT * FROM information_schema.sequences WHERE sequence_name = 'support_ticket_seq';

-- Reset if needed
SELECT setval('support_ticket_seq', 1000, false);
```

---

## 📚 Documentation References

- **Deployment Guide**: `docs/CUSTOMER_SUPPORT_DEPLOYMENT.md` (400 lines)
- **Implementation Summary**: `docs/CUSTOMER_SUPPORT_IMPLEMENTATION_SUMMARY.md` (600 lines)
- **ISO 27001 Compliance**: `docs/CUSTOMER_SUPPORT_ISO27001_COMPLIANCE.md` (500 lines)
- **Support Agent Guide**: `docs/SUPPORT_AGENT_QUICK_REFERENCE.md` (300 lines)
- **Migration Fix Guide**: `docs/CUSTOMER_SUPPORT_MIGRATION_FIX.md` (200 lines)

---

## ✅ Deployment Complete Checklist

- [ ] Migration 1 executed successfully
- [ ] Migration 2 executed successfully
- [ ] Realtime enabled for 3 tables
- [ ] Support agent roles assigned
- [ ] Frontend tested (user flow)
- [ ] Frontend tested (admin flow)
- [ ] Real-time updates verified
- [ ] Access control verified
- [ ] Statistics dashboard working
- [ ] Documentation reviewed
- [ ] Support team trained
- [ ] Monitoring set up

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Status**: _______________

---

**Support Contacts**:
- Technical Issues: tech@sloaneHub.com
- Security Issues: security@sloaneHub.com
- General Support: support@sloaneHub.com
