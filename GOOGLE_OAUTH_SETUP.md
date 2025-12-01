# 🔐 Google OAuth Setup - Step by Step

**Project**: zdenlybzgnphsrsvtufj  
**Status**: In Progress  
**Time Estimate**: 5-10 minutes

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### ✅ Step 1: Check Old Project for Existing Credentials (FASTEST)

1. **Open your OLD Supabase project** in a new browser tab:
   ```
   https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/providers
   ```

2. **Find Google provider** in the list

3. **Check if it's enabled**:
   - If YES: Copy the **Client ID** (visible)
   - Note: Client Secret is hidden, but if Google OAuth was working before, we can reuse the same credentials

4. **If Google was enabled in old project**:
   - ✅ You already have credentials!
   - ✅ Skip to Step 3 (Update Google Cloud Console)

5. **If Google was NOT enabled**:
   - ⏩ Skip to Step 2 (Create new credentials)

---

### 🆕 Step 2: Create New Google OAuth Credentials (If Needed)

#### 2.1: Go to Google Cloud Console
Open: https://console.cloud.google.com/apis/credentials

#### 2.2: Select or Create Project
- Use existing project OR
- Click "NEW PROJECT" → Name it "Kumii Platform" → Create

#### 2.3: Enable Google+ API (Required for OAuth)
1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Google+ API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for it to enable (takes a few seconds)

#### 2.4: Create OAuth Client ID
1. Go back to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. If prompted to configure consent screen:
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Choose **"External"** (unless you have Workspace)
   - Fill in:
     - App name: **Kumii Platform**
     - User support email: **your email**
     - Developer contact: **your email**
   - Click **"SAVE AND CONTINUE"**
   - Skip "Scopes" (click SAVE AND CONTINUE)
   - Skip "Test users" (click SAVE AND CONTINUE)
   - Click **"BACK TO DASHBOARD"**

5. Now create the OAuth client:
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** again
   - Application type: **"Web application"**
   - Name: **"Kumii - Supabase Auth"**

#### 2.5: Add Authorized Redirect URIs
In the "Authorized redirect URIs" section, click **"+ ADD URI"** and add:

```
https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
```

**IMPORTANT**: 
- ✅ Use `https://` (with 's')
- ✅ Use the NEW project ref: `zdenlybzgnphsrsvtufj`
- ✅ Exact path: `/auth/v1/callback`

#### 2.6: Create and Copy Credentials
1. Click **"CREATE"**
2. A popup will show your credentials:
   - **Client ID**: `1234567890-abc...googleusercontent.com`
   - **Client Secret**: `GOCSPX-abc123...`
3. **COPY BOTH** - you'll need them in the next step
4. Click **"OK"**

---

### 🔄 Step 3: Update Google Cloud Console (If Reusing Old Credentials)

If you're reusing credentials from the old project:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your existing OAuth 2.0 Client ID (used for old project)
3. Click on it to edit
4. In **"Authorized redirect URIs"**, click **"+ ADD URI"**
5. Add the NEW project callback URL:
   ```
   https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
   ```
6. Keep the old one if you still need it:
   ```
   https://qypazgkngxhazgkuevwq.supabase.co/auth/v1/callback
   ```
7. Click **"SAVE"**

---

### ⚙️ Step 4: Configure Supabase Auth Provider

1. **Open NEW Supabase project Auth Providers**:
   ```
   https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers
   ```

2. **Scroll to "Google"** provider

3. **Enable it**: Toggle the switch to ON

4. **Enter credentials**:
   - **Client ID (for OAuth)**: Paste your Google Client ID
     - Format: `1234567890-abc...googleusercontent.com`
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
     - Format: `GOCSPX-abc123...`

5. **Skip advanced settings** (keep defaults)

6. Click **"Save"**

---

### 🌐 Step 5: Configure Supabase Auth URLs

1. **Go to URL Configuration**:
   ```
   https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration
   ```

2. **Set Site URL**:
   ```
   http://localhost:8080
   ```

3. **Set Redirect URLs**: Add these (one per line):
   ```
   http://localhost:8080/**
   http://localhost:8080/onboarding
   http://localhost:8080/auth
   ```

4. Click **"Save"**

---

### 🧪 Step 6: Test Google OAuth

1. **Refresh your browser** at: http://localhost:8080/auth

2. **Click "Sign in with Google"** button

3. **Expected flow**:
   - ✅ Redirects to Google sign-in page
   - ✅ Shows "Kumii Platform wants to access your Google Account"
   - ✅ After allowing, redirects back to: http://localhost:8080/onboarding
   - ✅ User is logged in automatically
   - ✅ Profile is created in database

4. **Verify in Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/users
   - Should see new user with:
     - Email from Google
     - Provider: `google`
     - Last sign in: just now

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: Google redirect URI doesn't match Supabase callback URL

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure this EXACT URI is listed:
   ```
   https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
   ```
4. Save and try again

### Error: "Invalid client_id" or "Invalid client_secret"
**Cause**: Credentials not entered correctly in Supabase

**Fix**:
1. Go back to Google Cloud Console
2. View your OAuth client credentials
3. Copy them again (carefully)
4. Re-enter in Supabase Auth Providers
5. Save

### Error: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Complete the consent screen configuration
3. Add test users if needed
4. Try again

### Button doesn't appear or nothing happens
**Cause**: Browser cache or need to refresh

**Fix**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache for localhost:8080
3. Try in incognito/private window

---

## ✅ Success Checklist

- [ ] Google OAuth enabled in Supabase Dashboard
- [ ] Client ID and Client Secret entered
- [ ] Redirect URI added to Google Cloud Console
- [ ] Site URL set to http://localhost:8080
- [ ] Redirect URLs configured in Supabase
- [ ] Google sign-in button appears on /auth page
- [ ] Clicking button redirects to Google
- [ ] After Google auth, redirects to /onboarding
- [ ] User appears in Supabase Auth Users

---

## 📸 Screenshots to Verify

Take screenshots of these for documentation:

1. ✅ Google Cloud Console - OAuth client with correct redirect URI
2. ✅ Supabase Auth Providers - Google enabled
3. ✅ Supabase URL Configuration - URLs set
4. ✅ Google sign-in screen (during test)
5. ✅ New user in Supabase Auth Users with Google provider

---

## 🎯 Current Status

**What's Done**:
- ✅ Port mismatch fixed in code
- ✅ Auth.tsx updated to use current origin
- ✅ Dev server running on port 8080

**What's Needed**:
- ⏳ Enable Google provider in Supabase Dashboard (Step 4)
- ⏳ Configure redirect URIs in Google Cloud Console (Step 2 or 3)
- ⏳ Set Supabase Site URL (Step 5)

**Time to Complete**: 5-10 minutes

---

## 🚀 Quick Start (If You're Ready)

**For existing Google OAuth credentials**:
1. Open: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers
2. Enable Google
3. Copy credentials from old project
4. Update Google Cloud Console redirect URI
5. Test!

**For new credentials**:
1. Follow Step 2 completely
2. Then Step 4-6

---

**Ready?** Start with Step 1! Let me know when you've completed each step or if you hit any issues. 🚀
