# OAuth Provider Setup Guide

**Issue Resolved**: Port mismatch fixed ✅  
**Remaining**: Google OAuth needs to be enabled in Supabase

---

## 🔧 Fixed: Port Configuration

**Changed in**: `src/pages/Auth.tsx`

**Before** ❌:
```typescript
if (isProduction) {
  return `http://localhost:5173${path}`;  // Hardcoded port
}
```

**After** ✅:
```typescript
// Always use current origin to handle any port (5173, 8080, etc.)
const currentOrigin = window.location.origin;
return `${window.location.origin}${path}`;
```

**Result**: Auth redirects now automatically use the correct port (8080)

---

## 🔐 Enable Google OAuth Provider

### Step 1: Configure in Supabase Dashboard

1. **Go to Auth Providers**:
   ```
   https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers
   ```

2. **Find Google** in the list and click to configure

3. **Enable the provider** (toggle switch)

### Step 2: Get Google OAuth Credentials

#### Option A: Copy from Old Project (Fastest)

If you already had Google OAuth working in your old project:

1. Go to old project providers:
   ```
   https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/providers
   ```

2. Copy the **Client ID** and **Client Secret**

3. Paste them into the new project

4. **Update the Authorized Redirect URI** in Google Cloud Console:
   - Add: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
   - Keep old one if still needed

#### Option B: Create New Credentials

1. **Go to Google Cloud Console**:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Select your project** (or create new one)

3. **Enable Google+ API**:
   - Go to: APIs & Services > Library
   - Search for "Google+ API"
   - Click Enable

4. **Create OAuth 2.0 Client ID**:
   - Go to: APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: "Kumii Platform - Supabase Auth"

5. **Add Authorized Redirect URIs**:
   ```
   https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
   ```

6. **Save and copy**:
   - Client ID
   - Client Secret

7. **Paste into Supabase**:
   - Go back to Supabase Auth Providers
   - Enter Client ID and Client Secret
   - Save

### Step 3: Configure Supabase Auth URLs

1. **Go to URL Configuration**:
   ```
   https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration
   ```

2. **Set Site URL**:
   ```
   http://localhost:8080
   ```

3. **Add Redirect URLs**:
   ```
   http://localhost:8080/**
   http://localhost:8080/onboarding
   http://localhost:8080/auth
   ```

4. **For production** (when deploying), also add:
   ```
   https://your-production-domain.com/**
   ```

---

## 🔄 Alternative: Use Email/Password Only (Quick Test)

If you want to test the app immediately without setting up OAuth:

### Option 1: Disable Google Sign-In Button

Find the Google sign-in button in `Auth.tsx` and temporarily comment it out or hide it.

### Option 2: Use Email/Password Sign-Up

The email/password authentication should work immediately:
1. Go to http://localhost:8080/auth
2. Use the **Sign Up** tab
3. Enter email and password
4. Submit

This doesn't require any OAuth configuration.

---

## 📝 Other OAuth Providers

If you want to enable other providers (GitHub, Azure, etc.):

### GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Create OAuth App
3. Authorization callback URL: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### Microsoft Azure AD

1. Go to: https://portal.azure.com
2. Azure Active Directory > App registrations
3. New registration
4. Redirect URI: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
5. Copy Application (client) ID and create Client Secret
6. Enter in Supabase Auth Providers

---

## ✅ Testing OAuth Flow

After enabling Google OAuth:

1. **Refresh your browser** at http://localhost:8080/auth

2. **Click "Sign in with Google"**

3. **Expected flow**:
   - Redirects to Google sign-in
   - You authenticate with Google
   - Redirects back to `http://localhost:8080/onboarding`
   - Profile is created automatically

4. **Verify in Supabase**:
   - Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/users
   - Should see user with Google provider

---

## 🐛 Troubleshooting OAuth

### Error: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
```

### Error: "Invalid client_id"
**Solution**: Double-check Client ID is correct in Supabase Dashboard

### Error: "Provider not enabled"
**Solution**: Make sure the toggle is ON in Supabase Auth Providers

### User redirected to wrong URL
**Solution**: 
- Check Site URL in Supabase Auth settings
- Verify redirect URLs include your localhost:8080

---

## 📊 Auth Providers Status

| Provider | Status | Setup Time | Notes |
|----------|--------|------------|-------|
| Email/Password | ✅ Ready | 0 min | Works immediately |
| Google OAuth | ⏳ Needs Setup | 5-10 min | Requires credentials |
| GitHub OAuth | ⏳ Optional | 5 min | Easy to set up |
| Microsoft Azure | ⏳ Optional | 10 min | For enterprise users |

---

## 🎯 Recommended Next Steps

### For Development (Now)
1. ✅ Port mismatch fixed
2. ⏳ Enable Google OAuth (5 minutes)
3. ✅ Test email/password sign-up (works now)
4. ⏳ Test OAuth flow after enabling

### For Production (Later)
1. Copy OAuth settings to production Supabase project
2. Update redirect URIs with production domain
3. Update Site URL to production domain
4. Test all auth flows in production

---

**Current Status**: Auth system is functional with email/password. Google OAuth can be enabled in 5-10 minutes by following Step 2 above. 🚀
