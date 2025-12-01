# 🧪 Application Testing Checklist

**Server Status**: ✅ Running on http://localhost:8080  
**Project**: zdenlybzgnphsrsvtufj (NEW)  
**Critical Fix**: ✅ Applied - Client now uses environment variables

---

## ⚡ QUICK VERIFICATION (Do This First!)

### Step 1: Open Browser Console
1. Open http://localhost:8080
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste and run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Expected:', 'https://zdenlybzgnphsrsvtufj.supabase.co');
```

**Expected Result**: Both URLs should match!

---

## 🔐 Authentication Testing

### Test 1: Sign Up New User
- [ ] Go to http://localhost:8080/auth
- [ ] Click "Sign Up" tab
- [ ] Fill in:
  - First Name: Test
  - Last Name: User
  - Email: test@example.com
  - Password: TestPassword123!
- [ ] Submit form
- [ ] Check for success message or email confirmation prompt

**Verify in Database**:
- Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/users
- Should see new user with email test@example.com

### Test 2: Check Browser Console
- [ ] No red errors
- [ ] No 401/403 errors
- [ ] API calls go to zdenlybzgnphsrsvtufj.supabase.co

### Test 3: Check Network Tab
- [ ] Open DevTools > Network tab
- [ ] Filter by "fetch/XHR"
- [ ] All requests should go to:
  - `https://zdenlybzgnphsrsvtufj.supabase.co`
  - NOT `qypazgkngxhazgkuevwq`

---

## 📊 Database Verification

### Check Tables (After Sign Up)
Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor

**Verify these tables have data**:
- [ ] `auth.users` - New user appears
- [ ] `profiles` - Profile created automatically
- [ ] Check user_id matches between tables

---

## 🎯 Core Features Testing

### Test 4: Onboarding Flow
- [ ] After login, should redirect to /onboarding
- [ ] Select persona type (Startup/Mentor/Funder/etc.)
- [ ] Complete profile questions
- [ ] Submit and verify redirect to dashboard

### Test 5: Navigation
- [ ] Top navbar works
- [ ] Sidebar navigation functional
- [ ] All page routes load correctly

### Test 6: Data Operations
Try these common operations:
- [ ] View profile page
- [ ] Browse marketplace
- [ ] View funding opportunities
- [ ] Check mentors list

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid API key" error
**Solution**: 
- Check `.env` file has correct VITE_SUPABASE_ANON_KEY
- Restart dev server: `npm run dev`

### Issue: "Failed to fetch" errors
**Solution**:
- Check internet connection
- Verify Supabase project is active
- Check Supabase Dashboard for service status

### Issue: Email confirmation not working
**Solution**:
- Update Auth URLs in Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration
- Add: `http://localhost:8080/**`

### Issue: OAuth providers not working
**Solution**:
- Need to configure OAuth providers in new project
- Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers

---

## 📸 Screenshots to Take

For documentation purposes, capture:
- [ ] Successful sign up screen
- [ ] New user in Supabase Auth Users
- [ ] Profile in Database Editor
- [ ] Browser console with no errors
- [ ] Network tab showing correct API calls

---

## ✅ Success Criteria

**Application is working correctly when**:

1. ✅ No errors in browser console
2. ✅ Can sign up new users
3. ✅ Users appear in NEW database (zdenlybzgnphsrsvtufj)
4. ✅ API calls go to NEW project URL
5. ✅ Onboarding flow completes
6. ✅ Can navigate all pages
7. ✅ Data loads from database

---

## 🚨 If Something Goes Wrong

### Emergency Rollback
If you need to go back to old project temporarily:

1. Edit `src/integrations/supabase/client.ts`:
```typescript
const SUPABASE_URL = "https://qypazgkngxhazgkuevwq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "old-key-here";
```

2. Restart server

### Get Help
Check these resources:
- Supabase Dashboard: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
- Health Check Report: `HEALTH_CHECK_REPORT.md`
- Fix Summary: `FIX_APPLIED_SUMMARY.md`

---

## 📝 Testing Log

**Date**: November 30, 2025  
**Tester**: _____________

| Test | Status | Notes |
|------|--------|-------|
| URL Verification | ⏳ | |
| Sign Up | ⏳ | |
| Console Check | ⏳ | |
| Network Check | ⏳ | |
| Database Verify | ⏳ | |
| Onboarding | ⏳ | |
| Navigation | ⏳ | |
| Data Operations | ⏳ | |

**Overall Status**: ⏳ Testing in Progress

---

**Start Testing!** 🚀

Open http://localhost:8080 and begin with Quick Verification!
