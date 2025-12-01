# Quick Database Migration Deployment Guide

## 🎯 Deploy via Supabase Dashboard (Easiest Method)

### Step 1: Open Supabase SQL Editor

1. **Go to:** https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Copy the Migration SQL

**The migration file is located at:**
```
supabase/migrations/20251201000006_identity_security_controls.sql
```

**To view it in terminal:**
```bash
cat "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub/supabase/migrations/20251201000006_identity_security_controls.sql"
```

### Step 3: Paste and Execute

1. **Copy the entire SQL content** (584 lines)
2. **Paste into the SQL Editor**
3. **Click "Run"** button (or press Cmd+Enter)
4. **Wait for execution** (should take ~5-10 seconds)
5. **Verify success message:** "Success. No rows returned"

### Step 4: Verify Tables Created

Run this verification query in the SQL Editor:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND t.table_name = table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'auth_context_log',
    'token_fingerprints',
    'token_usage_events',
    'user_sessions',
    'csrf_tokens',
    'api_keys',
    'api_key_usage',
    'auth_events'
  )
ORDER BY table_name;
```

**Expected Result:** 8 tables should appear

### Step 5: Verify Functions Created

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'log_auth_event',
    'get_active_sessions',
    'terminate_session',
    'revoke_token',
    'cleanup_expired_sessions',
    'cleanup_old_auth_events',
    'cleanup_expired_tokens',
    'cleanup_expired_csrf_tokens'
  )
ORDER BY routine_name;
```

**Expected Result:** 8 functions should appear

---

## ✅ After Successful Deployment

### Update Deployment Status

The migration creates these database objects:

**8 Tables:**
1. ✅ `auth_context_log` - Authentication context and risk assessment logging
2. ✅ `token_fingerprints` - Token binding and device fingerprinting
3. ✅ `token_usage_events` - Token usage tracking and replay detection
4. ✅ `user_sessions` - Active user session management
5. ✅ `csrf_tokens` - CSRF protection tokens
6. ✅ `api_keys` - API key management
7. ✅ `api_key_usage` - API key usage tracking
8. ✅ `auth_events` - Comprehensive authentication event logging

**8 Functions:**
1. ✅ `log_auth_event()` - Log authentication events
2. ✅ `get_active_sessions()` - Retrieve user's active sessions
3. ✅ `terminate_session()` - Terminate a specific session
4. ✅ `revoke_token()` - Revoke an authentication token
5. ✅ `cleanup_expired_sessions()` - Automated session cleanup
6. ✅ `cleanup_old_auth_events()` - Automated event log cleanup
7. ✅ `cleanup_expired_tokens()` - Automated token cleanup
8. ✅ `cleanup_expired_csrf_tokens()` - Automated CSRF token cleanup

**Row Level Security (RLS):**
- All tables have RLS enabled
- Users can only view their own data
- Admins can view all data (where applicable)

---

## 🔍 Test the Conditional Access Function

After migration is deployed, test the Edge Function:

```bash
# Test conditional access function
curl -X POST https://zdenlybzgnphsrsvtufj.supabase.co/functions/v1/conditional-access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "user_id": "your-user-id",
    "session_id": "test-session-id",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0",
    "device_fingerprint": "test-fingerprint"
  }'
```

**Expected Response:**
```json
{
  "decision": "allow",
  "risk_score": 15,
  "risk_level": "low",
  "risk_factors": {
    "user_risk": 5,
    "device_risk": 0,
    "location_risk": 5,
    "behavior_risk": 5
  },
  "requires_mfa": false,
  "session_allowed": true
}
```

---

## 📊 Next Steps After Deployment

1. ✅ **Enable pg_cron for automated cleanup** (if not already enabled)
   ```sql
   -- Schedule hourly cleanup of expired sessions and CSRF tokens
   SELECT cron.schedule(
     'cleanup-expired-sessions',
     '0 * * * *',  -- Every hour
     'SELECT cleanup_expired_sessions();'
   );
   
   SELECT cron.schedule(
     'cleanup-expired-csrf',
     '0 * * * *',  -- Every hour
     'SELECT cleanup_expired_csrf_tokens();'
   );
   
   -- Schedule daily cleanup of old events and tokens
   SELECT cron.schedule(
     'cleanup-old-events',
     '0 2 * * *',  -- Daily at 2 AM
     'SELECT cleanup_old_auth_events();'
   );
   
   SELECT cron.schedule(
     'cleanup-expired-tokens',
     '0 2 * * *',  -- Daily at 2 AM
     'SELECT cleanup_expired_tokens();'
   );
   ```

2. ✅ **Update DEPLOYMENT_STATUS.md** to mark migration as deployed

3. ✅ **Test authentication flows** with the new security controls

4. ✅ **Configure conditional access policies** for your organization

5. ✅ **Enable MFA** for admin users

---

## 🚨 Troubleshooting

### Issue: "relation already exists"
**Solution:** Tables already exist from a previous deployment. Safe to ignore or drop and recreate.

### Issue: "permission denied"
**Solution:** Make sure you're connected as the `postgres` user in the SQL Editor.

### Issue: "function does not exist: uuid_generate_v4"
**Solution:** Enable the uuid-ossp extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📞 Need Help?

- **Supabase Dashboard:** https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
- **Documentation:** `docs/IDENTITY_SECURITY_CONTROLS.md`
- **Migration File:** `supabase/migrations/20251201000006_identity_security_controls.sql`
- **Edge Function:** `supabase/functions/conditional-access/index.ts`

---

**Last Updated:** December 1, 2025  
**Migration Version:** 20251201000006
