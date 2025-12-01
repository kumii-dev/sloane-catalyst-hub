# 🔐 Google OAuth Testing Guide

**Date**: December 1, 2025  
**Status**: ✅ Google OAuth Enabled in Supabase  
**Project**: zdenlybzgnphsrsvtufj

---

## ✅ Configuration Verified

### Supabase Settings
- ✅ Google OAuth provider enabled
- ✅ Project: zdenlybzgnphsrsvtufj
- ✅ Region: eu-west-1

### Application Settings
- ✅ Dev server: http://localhost:8080
- ✅ Dynamic redirect URLs (uses `window.location.origin`)
- ✅ OAuth flow configured in `Auth.tsx`

---

## 🧪 Testing Steps

### 1. Access the Login Page

Open your browser and navigate to:
```
http://localhost:8080/auth
```

### 2. Test Google OAuth Flow

1. **Click "Continue with Google"** button
2. **Select Google account** (or login to Google)
3. **Grant permissions** to Kumii application
4. **Wait for redirect** back to application

**Expected Flow**:
```
1. Click "Continue with Google"
   ↓
2. Redirect to Google OAuth consent screen
   ↓
3. User selects/logs into Google account
   ↓
4. User grants permissions
   ↓
5. Redirect to: http://localhost:8080/onboarding
   ↓
6. User profile created in database
```

### 3. Verify User in Database

After successful OAuth login, check Supabase:

1. Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor
2. Run this query:

```sql
-- Check if OAuth user was created
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 5;
```

**Expected Result**:
- User record with your Google email
- `auth_provider` = "google"
- `email_confirmed_at` is set (Google emails are pre-verified)

### 4. Check Profile Creation

```sql
-- Verify profile was created
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.created_at
FROM profiles p
WHERE p.email = 'your-google-email@gmail.com';
```

---

## 🔍 What to Check

### During OAuth Flow:

✅ **Browser redirects to Google** - You should see google.com URL  
✅ **Consent screen appears** - Shows app name and permissions  
✅ **Redirects back to localhost:8080** - After clicking "Allow"  
✅ **Onboarding page loads** - URL: http://localhost:8080/onboarding  
✅ **No console errors** - Check browser DevTools Console tab

### In Browser DevTools (F12):

Check **Console** for:
- ❌ No CORS errors
- ❌ No "invalid_grant" errors
- ❌ No "redirect_uri_mismatch" errors
- ✅ Successful auth messages

Check **Network** tab:
- ✅ POST to `/auth/v1/token` succeeds (200 OK)
- ✅ GET to `/auth/v1/user` succeeds (200 OK)

Check **Application → Local Storage**:
- ✅ `supabase.auth.token` exists
- ✅ Contains access_token and refresh_token

---

## ⚠️ Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"

**Error**: OAuth redirect URI mismatch

**Cause**: Google Cloud Console redirect URI doesn't match

**Solution**: Update Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
   ```
4. Save changes
5. Wait 5 minutes for propagation

### Issue 2: "Unsupported provider"

**Error**: Provider is not enabled

**Cause**: Google not enabled in Supabase project

**Solution**: ✅ **ALREADY DONE** - You enabled it!

### Issue 3: Redirect to wrong URL

**Error**: Redirects to wrong port or domain

**Cause**: Supabase Site URL misconfigured

**Solution**: 
1. Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration
2. Set **Site URL**: `http://localhost:8080`
3. Add **Redirect URLs**:
   - `http://localhost:8080/**`
   - `http://localhost:8080/onboarding`
   - `http://localhost:8080/auth`
4. Save changes

### Issue 4: CORS Error

**Error**: CORS policy blocked request

**Cause**: Supabase doesn't recognize localhost:8080

**Solution**: Add to Supabase Auth → URL Configuration:
- Additional Redirect URLs: `http://localhost:8080/**`

### Issue 5: User created but no profile

**Error**: User exists in auth.users but not in profiles table

**Cause**: Profile trigger didn't fire or failed

**Solution**: Check trigger exists:
```sql
-- Verify trigger
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%profile%'
  AND event_object_table = 'users';
```

If missing, create it:
```sql
-- Create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 Success Checklist

After testing, verify:

- [ ] Clicked "Continue with Google" button
- [ ] Google consent screen appeared
- [ ] Selected Google account
- [ ] Granted permissions
- [ ] Redirected to http://localhost:8080/onboarding
- [ ] No errors in browser console
- [ ] User exists in `auth.users` table
- [ ] Profile exists in `profiles` table
- [ ] Can navigate to profile page
- [ ] User data displays correctly
- [ ] Can logout and login again with Google

---

## 📊 Testing Scenarios

### Scenario 1: New User (First Time)

**Steps**:
1. Use Google account that has never logged in
2. Click "Continue with Google"
3. Grant permissions

**Expected**:
- New record in `auth.users`
- New record in `profiles`
- Redirect to `/onboarding`
- Empty profile (needs completion)

### Scenario 2: Returning User

**Steps**:
1. Logout from application
2. Click "Continue with Google"
3. Select same Google account

**Expected**:
- No new user record (uses existing)
- Redirect to homepage or dashboard (not onboarding)
- Profile data preserved

### Scenario 3: Multiple Sign-in Methods

**Steps**:
1. Create account with email/password
2. Logout
3. Try "Continue with Google" with **same email**

**Expected Behavior**:
- ⚠️ Depends on Supabase settings
- Option A: Links accounts automatically
- Option B: Shows error "Email already registered"

**Check Setting**: 
- Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers
- Look for "Allow Multiple Identities" setting

---

## 🔐 Security Verification

### Check OAuth Tokens

Open DevTools → Application → Local Storage → `supabase.auth.token`:

```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "your-email@gmail.com",
    "app_metadata": {
      "provider": "google"
    }
  }
}
```

### Verify Token Expiry

Tokens should automatically refresh. Test:
1. Login with Google
2. Wait 1 hour
3. Perform an action (e.g., view profile)
4. Check Network tab for `/auth/v1/token` refresh request

---

## 📝 OAuth Flow Details

### What Happens Behind the Scenes:

```
1. User clicks "Continue with Google"
   ↓
2. App calls: supabase.auth.signInWithOAuth({ provider: 'google' })
   ↓
3. Supabase generates OAuth URL with:
   - client_id (from Google Cloud Console)
   - redirect_uri (Supabase callback URL)
   - scope (email, profile)
   - state (CSRF protection)
   ↓
4. Browser redirects to Google
   ↓
5. User authenticates with Google
   ↓
6. Google redirects to: 
   https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback?code=xxx
   ↓
7. Supabase exchanges code for tokens
   ↓
8. Supabase creates/updates user in auth.users
   ↓
9. Supabase redirects to: http://localhost:8080/onboarding
   ↓
10. App receives session via supabase.auth.onAuthStateChange
   ↓
11. Profile trigger creates record in profiles table
   ↓
12. App navigates user to appropriate page
```

---

## 🚀 Next Steps After Successful Test

1. **Test Email/Password Login** - Ensure it still works
2. **Test Logout** - Verify session cleanup
3. **Test Profile Editing** - Update user information
4. **Test Protected Routes** - Access admin pages (if admin)
5. **Test Session Persistence** - Refresh page, still logged in
6. **Test on Mobile** - Responsive OAuth flow

---

## 📞 Support

### If OAuth Still Not Working:

1. **Check Supabase Logs**:
   - Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/logs/explorer
   - Filter by: auth errors
   - Look for OAuth-related issues

2. **Check Google Cloud Console**:
   - Verify OAuth consent screen is published
   - Check API quotas not exceeded
   - Verify credentials are for correct project

3. **Check Application Logs**:
   ```bash
   # In terminal where dev server is running
   # Look for auth-related errors
   ```

4. **Test with Different Browser**:
   - Try incognito mode
   - Clear all cookies
   - Disable browser extensions

---

## ✅ Configuration Summary

### Supabase (Already Configured):
- ✅ Google provider enabled
- ✅ OAuth credentials set
- ✅ Redirect URIs configured

### Application (Already Configured):
- ✅ Dynamic redirect URL: Uses `window.location.origin`
- ✅ Port: 8080
- ✅ OAuth button: "Continue with Google"
- ✅ Success redirect: `/onboarding`

### Google Cloud Console (Should Be Configured):
- ✅ OAuth 2.0 Client ID created
- ✅ Authorized redirect URI: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
- ✅ OAuth consent screen configured
- ✅ Credentials added to Supabase

---

## 🎉 Ready to Test!

**To begin testing**:

1. Open: http://localhost:8080/auth
2. Click: "Continue with Google"
3. Complete OAuth flow
4. Verify user created in database

**Report Issues**: Check browser console and Supabase logs for errors

Good luck! 🚀
