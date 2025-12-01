# Supabase Replication - Final Steps

## Current Situation

✅ **Completed:**
- Old project backed up (qypazgkngxhazgkuevwq)
- New project created (zdenlybzgnphsrsvtufj)
- All migrations cleaned (removed seed data)
- Combined migration file generated
- Project is active and responding

⚠️ **Issue:**
- Supabase CLI cannot connect due to network/IPv6 routing issues
- Connection refused on port 5432 (database pooler)

## Solution: Use Supabase Dashboard

Since CLI is having connection issues, apply migrations via the Supabase Dashboard SQL Editor.

### Step-by-Step Instructions

#### 1. Open Your Project
Go to: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj

#### 2. Navigate to SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "New Query"

#### 3. Apply Migrations

**Option A: Use the Combined File (Recommended - Fastest)**

```bash
# The file is already created: combined_migrations.sql
# 1. Open it in VS Code or any text editor
# 2. Select all (Cmd+A)
# 3. Copy (Cmd+C)
# 4. Paste into SQL Editor
# 5. Click "Run" (or press Cmd+Enter)
```

**Option B: Apply One by One (More Controlled)**

Apply each migration file in order starting from:
1. `20251005100252_92ba2d47-47a1-448e-9e44-250aa58a33f0.sql`
2. `20251005100614_92f19ac1-77ea-4759-9362-72856e0ddc6c.sql`
3. ... (see full list in manual-migration-guide.sh output)
4. `20251125111816_ce1689ac-ecf8-4df7-9a41-121b50fc4c15.sql`

### Verification

After applying migrations, verify by running this query in SQL Editor:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check migration history
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

You should see tables like:
- profiles
- user_roles
- startup_profiles
- funders
- services
- listings
- transactions
- etc.

### Next Steps After Migrations

#### 1. Update Your Local Configuration

```bash
# Update .env file
cp .env.new .env

# Or manually update these values:
VITE_SUPABASE_PROJECT_ID="zdenlybzgnphsrsvtufj"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-new-anon-key>"
VITE_SUPABASE_URL="https://zdenlybzgnphsrsvtufj.supabase.co"
```

Get your keys from:
https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/settings/api

#### 2. Copy Storage Buckets (if any)

1. Go to old project: https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/storage/buckets
2. Note all bucket names and their policies
3. Go to new project: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/storage/buckets
4. Recreate buckets with same names and settings
5. Download files from old buckets and upload to new ones

#### 3. Configure Authentication

Copy settings from old to new project:

**Email Templates:**
- Old: https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/templates
- New: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/templates

**Auth Providers:**
- Old: https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/providers
- New: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/providers

**URL Configuration:**
- Old: https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq/auth/url-configuration
- New: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/auth/url-configuration

#### 4. Deploy Edge Functions

Once CLI connection works again (or use Dashboard):

```bash
supabase functions deploy --project-ref zdenlybzgnphsrsvtufj
```

Or deploy individually via Dashboard:
- analyze-credit-assessment
- create-daily-room
- generate-narration
- generate-matches
- send-booking-email
- send-review-request
- copilot-chat
- get-daily-token
- subscribe-status-notifications

#### 5. Export and Import Data (Optional)

If you want to copy actual data (not just schema):

**From Old Project:**
```bash
# Export data
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.qypazgkngxhazgkuevwq.supabase.co:5432/postgres" --data-only -f old_data.sql
```

**To New Project:**
Use SQL Editor to run the old_data.sql content, or:
```bash
psql "postgresql://postgres:[PASSWORD]@db.zdenlybzgnphsrsvtufj.supabase.co:5432/postgres" < old_data.sql
```

#### 6. Test Your Application

```bash
# Update environment and test
npm run dev
```

Test:
- ✓ User authentication
- ✓ Database queries
- ✓ File uploads
- ✓ All features work

## Files Created

- `SUPABASE_REPLICATION_GUIDE.md` - Complete replication guide
- `TROUBLESHOOTING.md` - Connection troubleshooting guide
- `replicate-supabase.sh` - Automated replication script (for when CLI works)
- `manual-migration-guide.sh` - Manual migration helper
- `combined_migrations.sql` - All migrations in one file (READY TO USE)
- `.env.backup` - Backup of original configuration
- `.env.new` - Template for new configuration

## Quick Reference

**Old Project:**
- ID: `qypazgkngxhazgkuevwq`
- URL: https://qypazgkngxhazgkuevwq.supabase.co
- Dashboard: https://supabase.com/dashboard/project/qypazgkngxhazgkuevwq

**New Project:**
- ID: `zdenlybzgnphsrsvtufj`
- URL: https://zdenlybzgnphsrsvtufj.supabase.co
- Dashboard: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
- SQL Editor: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor

## Support

If you encounter issues:
1. Check TROUBLESHOOTING.md
2. Verify project is not paused in Dashboard
3. Check Supabase status: https://status.supabase.com/
4. Contact Supabase support if needed

---

**Status**: Ready to apply migrations via Dashboard
**File to Use**: `combined_migrations.sql` (6934 lines)
**Last Updated**: November 28, 2025
