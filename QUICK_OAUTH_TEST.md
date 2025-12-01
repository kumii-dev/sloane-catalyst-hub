# ✅ OAuth Testing Quick Checklist

**Date**: December 1, 2025  
**Server**: ✅ Running on http://localhost:8080  
**OAuth Status**: ✅ Google OAuth Enabled in Supabase

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Open Login Page
```
http://localhost:8080/auth
```

### Step 2: Test Google OAuth
1. ✅ Click **"Continue with Google"** button
2. ✅ Google login page appears
3. ✅ Select your Google account
4. ✅ Grant permissions
5. ✅ Redirected to onboarding page

### Step 3: Verify Success
- ✅ URL changed to: `http://localhost:8080/onboarding`
- ✅ No errors in browser console (F12)
- ✅ User logged in (check top-right profile icon)

---

## 🔍 If Issues Occur

### Error: "redirect_uri_mismatch"
**Quick Fix**: Update Supabase Auth URLs
1. Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration
2. Set **Site URL**: `http://localhost:8080`
3. Add **Redirect URL**: `http://localhost:8080/**`
4. Save and retry

### Error: OAuth window closes immediately
**Quick Fix**: Check Google Cloud Console
1. Verify OAuth callback URL: `https://zdenlybzgnphsrsvtufj.supabase.co/auth/v1/callback`
2. Ensure OAuth consent screen is published
3. Check credentials are active

### No errors but stays on login page
**Quick Fix**: Check browser console (F12)
- Look for CORS errors
- Look for auth errors
- Check Network tab for failed requests

---

## ✅ Success Indicators

You'll know it worked when:
1. ✅ Google login popup appeared
2. ✅ Redirected to onboarding page after login
3. ✅ Can see your email/profile in top-right corner
4. ✅ Can navigate to other pages while logged in
5. ✅ User appears in Supabase auth.users table

---

## 📊 Verify in Database (Optional)

Run in Supabase SQL Editor:
```sql
SELECT 
  email,
  created_at,
  raw_app_meta_data->>'provider' as provider
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

Should show your Google email with `provider = 'google'`

---

## 🎯 Next: Test Admin Access

After successful OAuth login:

1. **Logout** from the app
2. **Login as**: mncubekhulekani@gmail.com (with Google)
3. **Navigate to**: http://localhost:8080/admin
4. **Verify**: Admin dashboard loads (not redirected)

---

## 📝 Test Results

Mark your progress:

- [ ] Google OAuth button visible
- [ ] Clicking button opens Google login
- [ ] Successfully logged in with Google
- [ ] Redirected to onboarding page
- [ ] Profile created in database
- [ ] Can access protected pages
- [ ] Can logout and login again
- [ ] Admin user (mncubekhulekani@gmail.com) can access /admin

---

## 🚀 Ready to Test!

**Your server is live at**: http://localhost:8080

**Start here**: http://localhost:8080/auth

**Click**: "Continue with Google" button

Good luck! Let me know if you encounter any issues. 🎉
