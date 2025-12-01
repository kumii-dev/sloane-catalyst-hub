# 🚀 Google OAuth - Quick Reference Card

## 📍 URLs You'll Need

### Supabase Dashboard
```
Enable Provider:
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers

URL Configuration:
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration

Check Users:
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/users
```

### Google Cloud Console
```
Credentials:
https://console.cloud.google.com/apis/credentials

OAuth Consent Screen:
https://console.cloud.google.com/apis/credentials/consent

Enable APIs:
https://console.cloud.google.com/apis/library
```

### Old Project (for copying credentials)
```
https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/providers
```

---

## 🔑 Required Values

### Google Cloud Console → Supabase
Copy these from Google Cloud Console to Supabase:
```
Client ID: [1234567890-abc...googleusercontent.com]
Client Secret: [GOCSPX-abc123...]
```

### Redirect URI (add to Google Cloud Console)
```
https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback
```

### Supabase Site URL
```
http://localhost:8080
```

### Supabase Redirect URLs
```
http://localhost:8080/**
http://localhost:8080/onboarding
http://localhost:8080/auth
```

---

## ⚡ Quick Setup (3 Options)

### Option A: Copy from Old Project (Fastest - 2 minutes)
1. Open old project: `qypazgkngxhazgkuevwq/auth/providers`
2. Copy Google Client ID
3. Go to Google Cloud Console → edit OAuth client
4. Add new redirect URI: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
5. Paste credentials into new project: `zdenlybzgnphsrsvtufj/auth/providers`
6. Configure URLs in Supabase
7. Test!

### Option B: New Credentials (10 minutes)
1. Google Cloud Console → Create OAuth client
2. Enable Google+ API
3. Configure consent screen
4. Add redirect URI
5. Copy Client ID + Secret
6. Paste into Supabase
7. Configure URLs
8. Test!

### Option C: Test with Email/Password First
1. Use email/password auth (works now)
2. Set up OAuth later when you have time

---

## ✅ Verification Steps

After setup:
1. ✅ Refresh http://localhost:8080/auth
2. ✅ Click "Sign in with Google"
3. ✅ Should redirect to Google sign-in
4. ✅ After auth, returns to /onboarding
5. ✅ Check Supabase users - new user with Google provider

---

## 🆘 Common Issues & Fixes

| Error | Fix |
|-------|-----|
| "Provider not enabled" | Enable in Supabase Dashboard |
| "redirect_uri_mismatch" | Check Google Cloud Console URI exactly matches |
| "Invalid client_id" | Re-enter credentials in Supabase |
| Button doesn't work | Hard refresh browser (Ctrl+Shift+R) |
| "Access blocked" | Configure OAuth consent screen |

---

## 📞 Need Help?

Full detailed guide: `GOOGLE_OAUTH_SETUP.md`

---

**Current Status**: ⏳ Waiting for you to enable Google OAuth

**Next Step**: Go to https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers
