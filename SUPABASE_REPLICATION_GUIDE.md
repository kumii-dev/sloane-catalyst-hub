# Supabase Database Replication Guide

This guide will help you replicate your Supabase database from the current project to a new Supabase project.

## Prerequisites

- ✅ Supabase CLI installed (already installed)
- 🔑 Access to both Supabase projects (old and new)
- 📝 New Supabase project credentials

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in the project details:
   - Project name
   - Database password (save this!)
   - Region (preferably same as old project)
4. Wait for project to be created
5. Note down the following from Project Settings > API:
   - Project URL
   - Project ID (from Project Settings > General)
   - Anon/Public key
   - Service Role key (keep this secret!)

## Step 2: Link Supabase CLI to New Project

```bash
# Login to Supabase (if not already logged in)
supabase login

# Link to the new project
supabase link --project-ref YOUR_NEW_PROJECT_ID
```

When prompted, enter your new database password.

## Step 3: Push Existing Migrations to New Project

Your project already has 90 migration files in `supabase/migrations/`. To apply them to the new project:

```bash
# Push all migrations to the new project
supabase db push

# Or push remotely
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-NEW-PROJECT-REF].supabase.co:5432/postgres"
```

This will apply all 90 migrations in order, recreating your entire database schema.

## Step 4: Verify Schema Migration

```bash
# Check if all tables were created
supabase db diff

# Or connect to the database and verify manually
supabase db diff --linked
```

## Step 5: Export Data from Old Project

### Option A: Using Supabase Studio (For Small Databases)

1. Go to old project's Supabase Dashboard
2. Table Editor > Select each table
3. Export as CSV
4. Import CSVs into new project via Studio

### Option B: Using pg_dump (Recommended for Large Databases)

```bash
# Export data only (no schema) from old project
pg_dump "postgresql://postgres:[OLD-PASSWORD]@db.qypazgkngxhazgkuevwq.supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  --exclude-schema=storage \
  --exclude-schema=auth \
  --exclude-schema=realtime \
  --exclude-schema=supabase_functions \
  > old_project_data.sql

# Import data into new project
psql "postgresql://postgres:[NEW-PASSWORD]@db.[YOUR-NEW-PROJECT-REF].supabase.co:5432/postgres" \
  < old_project_data.sql
```

### Option C: Using Supabase CLI (Easiest)

```bash
# Backup old database
supabase db dump --db-url "postgresql://postgres:[OLD-PASSWORD]@db.qypazgkngxhazgkuevwq.supabase.co:5432/postgres" \
  --data-only \
  -f backup_data.sql

# Restore to new database
psql "postgresql://postgres:[NEW-PASSWORD]@db.[YOUR-NEW-PROJECT-REF].supabase.co:5432/postgres" \
  < backup_data.sql
```

## Step 6: Copy Edge Functions (if any)

Your project has Edge Functions. To deploy them to the new project:

```bash
# Deploy all functions to new project
supabase functions deploy --project-ref YOUR_NEW_PROJECT_ID

# Or deploy individually
supabase functions deploy analyze-credit-assessment --project-ref YOUR_NEW_PROJECT_ID
supabase functions deploy create-daily-room --project-ref YOUR_NEW_PROJECT_ID
# ... repeat for all functions
```

## Step 7: Copy Storage Buckets and Files

### Create Buckets in New Project

1. Go to new project Dashboard > Storage
2. Recreate all buckets from old project
3. Set same policies and permissions

### Copy Files Between Buckets

Use the Supabase CLI or write a script:

```javascript
// Example script to copy storage files
const { createClient } = require('@supabase/supabase-js')

const oldSupabase = createClient(
  'https://qypazgkngxhazgkuevwq.supabase.co',
  'OLD_SERVICE_ROLE_KEY'
)

const newSupabase = createClient(
  'https://YOUR_NEW_PROJECT.supabase.co',
  'NEW_SERVICE_ROLE_KEY'
)

// Copy files from bucket
async function copyBucket(bucketName) {
  const { data: files } = await oldSupabase.storage.from(bucketName).list()
  
  for (const file of files) {
    const { data } = await oldSupabase.storage.from(bucketName).download(file.name)
    await newSupabase.storage.from(bucketName).upload(file.name, data)
  }
}
```

## Step 8: Update Your Application Configuration

Create a new `.env` file or update the existing one:

```bash
# Backup current .env
cp .env .env.old

# Update with new project credentials
VITE_SUPABASE_PROJECT_ID="YOUR_NEW_PROJECT_ID"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_NEW_ANON_KEY"
VITE_SUPABASE_URL="https://YOUR_NEW_PROJECT_ID.supabase.co"
```

Update `supabase/config.toml`:

```toml
project_id = "YOUR_NEW_PROJECT_ID"

# Keep the same function configurations
[functions.analyze-credit-assessment]
verify_jwt = true
# ... rest of your function configs
```

## Step 9: Copy Row Level Security (RLS) Policies

RLS policies should be included in your migrations, but verify:

```bash
# Check RLS policies in old project
supabase db diff --db-url "postgresql://postgres:[OLD-PASSWORD]@db.qypazgkngxhazgkuevwq.supabase.co:5432/postgres"
```

If any policies are missing, create a new migration:

```bash
supabase migration new add_missing_rls_policies
# Edit the generated migration file
supabase db push
```

## Step 10: Copy Authentication Settings

1. **Email Templates**: Dashboard > Authentication > Email Templates
2. **Auth Providers**: Dashboard > Authentication > Providers (Google, GitHub, etc.)
3. **URL Configuration**: Dashboard > Authentication > URL Configuration
4. **Rate Limits**: Dashboard > Authentication > Rate Limits

## Step 11: Test the New Project

```bash
# Run your application with new credentials
npm run dev

# Test all features:
# - User authentication
# - Database queries
# - File uploads/downloads
# - Edge functions
```

## Step 12: Update Production Environment Variables

Once verified, update your production deployment:

1. Update environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Redeploy your application
3. Monitor for any issues

## Automated Replication Script

For future replications, you can create a script:

```bash
#!/bin/bash

# replication.sh
OLD_PROJECT_REF="qypazgkngxhazgkuevwq"
NEW_PROJECT_REF="$1"
OLD_DB_PASSWORD="$2"
NEW_DB_PASSWORD="$3"

echo "Starting replication from $OLD_PROJECT_REF to $NEW_PROJECT_REF..."

# Link to new project
supabase link --project-ref $NEW_PROJECT_REF

# Push migrations
echo "Pushing migrations..."
supabase db push

# Export and import data
echo "Exporting data..."
supabase db dump --db-url "postgresql://postgres:$OLD_DB_PASSWORD@db.$OLD_PROJECT_REF.supabase.co:5432/postgres" \
  --data-only \
  -f backup_data.sql

echo "Importing data..."
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.$NEW_PROJECT_REF.supabase.co:5432/postgres" \
  < backup_data.sql

# Deploy functions
echo "Deploying functions..."
supabase functions deploy --project-ref $NEW_PROJECT_REF

echo "Replication complete!"
echo "Remember to:"
echo "1. Copy storage buckets manually"
echo "2. Update authentication settings"
echo "3. Update .env file"
```

## Troubleshooting

### Issue: Migration Conflicts

```bash
# Reset migrations and start fresh
supabase db reset --linked
supabase db push
```

### Issue: Permission Errors

Make sure you're using the Service Role key for administrative operations.

### Issue: Data Import Errors

Check for:
- Foreign key constraints (import in correct order)
- Unique constraint violations
- Data type mismatches

## Important Notes

⚠️ **Security**: Keep your service role keys secret!
⚠️ **Testing**: Always test thoroughly before switching production
⚠️ **Backup**: Keep backups of your old project until verification is complete
⚠️ **Downtime**: Plan for minimal downtime during the switch

## Quick Reference

Current Project:
- Project ID: `qypazgkngxhazgkuevwq`
- URL: `https://qypazgkngxhazgkuevwq.supabase.co`
- Migrations: 90 files in `supabase/migrations/`
- Edge Functions: 8 functions in `supabase/functions/`

---

**Last Updated**: November 27, 2025
