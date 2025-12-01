# Supabase Replication Troubleshooting Guide

## Current Issue: Connection Refused

The error `connection refused` when trying to connect to your new Supabase project typically means:

### Possible Causes

1. **Project is Paused (Most Common)**
   - New Supabase projects on the free tier may be paused after creation
   - Projects automatically pause after period of inactivity

2. **Project is Still Initializing**
   - New projects can take 2-5 minutes to fully initialize
   - Database might not be ready yet

3. **Network Restrictions**
   - Your IP might not be allowed
   - Firewall blocking port 5432

### Solutions

#### Solution 1: Check and Resume Project (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project: **zdenlybzgnphsrsvtufj**
3. Look for a "Resume" or "Restore" button if the project is paused
4. Wait for the project to become active (green indicator)
5. Try the migration again

#### Solution 2: Wait for Initialization

If the project was just created:
```bash
# Wait 2-3 minutes, then try again
sleep 180
echo "y" | supabase db push
```

#### Solution 3: Check Project Status via CLI

```bash
# List your projects and check status
supabase projects list

# Should show something like:
# PROJECT ID               NAME                    ORGANIZATION ID         REGION          CREATED AT (UTC)
# zdenlybzgnphsrsvtufj     your-project-name       your-org-id            eu-west-1       2025-11-27 15:00:00
```

#### Solution 4: Try Direct Database Connection

Instead of using the pooler, try direct connection:

```bash
# Use the direct database URL (not pooler)
supabase db push --db-url "postgresql://postgres:We_are_cooking_at_Kumi@SloaneCapital@db.zdenlybzgnphsrsvtufj.supabase.co:5432/postgres"
```

#### Solution 5: Check Network Configuration

1. Go to Dashboard > Project Settings > Database
2. Check "Connection Pooling" settings
3. Verify SSL requirements
4. Check if IPv6 is required

#### Solution 6: Use Migration Files Manually

If CLI connection keeps failing, you can apply migrations manually:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of each migration file
4. Run them one by one in order

Start with:
```bash
ls -1 supabase/migrations/*.sql | sort
```

Then copy and paste each file's content into the SQL Editor.

### Alternative: Use pgAdmin or psql Directly

If Supabase CLI isn't working, use standard PostgreSQL tools:

```bash
# Using psql directly
psql "postgresql://postgres:We_are_cooking_at_Kumi@SloaneCapital@db.zdenlybzgnphsrsvtufj.supabase.co:5432/postgres" -f supabase/migrations/20251011140303_248bf2a6-9af6-4c13-9d4f-eb14cde6759f.sql

# Or apply all migrations in order
for file in supabase/migrations/*.sql; do
  echo "Applying $file..."
  psql "postgresql://postgres:We_are_cooking_at_Kumi@SloaneCapital@db.zdenlybzgnphsrsvtufj.supabase.co:5432/postgres" -f "$file"
done
```

### Check Project Health

```bash
# Test basic connectivity
curl https://zdenlybzgnphsrsvtufj.supabase.co/rest/v1/

# Should return something like:
# {"message":"The server is running"}
```

### Current Status

- **Old Project ID**: qypazgkngxhazgkuevwq ✅ Working
- **New Project ID**: zdenlybzgnphsrsvtufj ⚠️ Connection refused
- **DNS Resolution**: ✅ Working
- **Network**: ✅ Working
- **Migration Files Fixed**: ✅ Seed data removed

### What We've Fixed So Far

1. ✅ Removed seed data from migration `20251011140303`
2. ✅ Removed seed data from migration `20251027115220`
3. ✅ Verified DNS resolution is working
4. ✅ Confirmed network connectivity

### Next Steps

1. **Check Supabase Dashboard** - Most likely the project is paused
2. **Resume the project** if paused
3. **Wait 2-3 minutes** for it to fully start
4. **Retry the migration**: `echo "y" | supabase db push`

### If Still Failing

Contact Supabase support or use the manual SQL Editor method described above.

---

**Project Details:**
- New Project ID: `zdenlybzgnphsrsvtufj`
- Region: `eu-west-1`
- Pooler: `aws-1-eu-west-1.pooler.supabase.com:5432`
- Direct: `db.zdenlybzgnphsrsvtufj.supabase.co:5432`

**Last Updated**: November 28, 2025
