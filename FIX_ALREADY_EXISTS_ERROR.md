# How to Fix "Type Already Exists" Error

## The Problem

The error `type "mentor_status" already exists` means some migrations have already been applied to your new database. Running all migrations again will cause conflicts.

## The Solution

Apply only the **remaining** migrations that haven't been applied yet.

---

## Method 1: Automatic (Recommended)

### Step 1: Check Last Applied Migration

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor

2. Run this query:

```sql
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 1;
```

3. Note the `version` number (e.g., `20251006092014`)

### Step 2: Generate Remaining Migrations

In your terminal, run:

```bash
./generate-remaining-migrations.sh
```

When prompted, enter the version number from Step 1.

This will create: `remaining_migrations.sql`

### Step 3: Apply Remaining Migrations

1. Open `remaining_migrations.sql` in VS Code
2. Copy all contents (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click "Run"

Done! ✅

---

## Method 2: Manual

### Step 1: Find Last Applied Migration

Run `find_last_migration.sql` in Supabase SQL Editor to see which was the last migration applied.

### Step 2: Apply Migrations Individually

Starting from the NEXT migration after your last applied one, copy and paste each file into SQL Editor:

For example, if last applied was `20251006092014`, start with:
1. `supabase/migrations/20251011140303_248bf2a6-9af6-4c13-9d4f-eb14cde6759f.sql`
2. `supabase/migrations/20251011143112_bd6c7b26-5ce2-4eb3-83cd-dd5e7ea63efc.sql`
3. And so on...

Apply each one by one, checking for errors after each.

---

## Method 3: Reset and Start Fresh (Nuclear Option)

If you want to start completely fresh:

### Step 1: Drop All Tables

⚠️ **WARNING**: This deletes everything in the database!

```sql
-- Get drop commands for all tables
SELECT 'DROP TABLE IF EXISTS ' || table_schema || '.' || table_name || ' CASCADE;'
FROM information_schema.tables
WHERE table_schema = 'public';

-- Copy the output and run it
```

### Step 2: Clear Migration History

```sql
DELETE FROM supabase_migrations.schema_migrations;
```

### Step 3: Apply All Migrations

Now use the original `combined_migrations.sql` file.

---

## Quick Reference

### Files to Use:

- **`find_last_migration.sql`** - Check what's been applied
- **`check_migrations.sql`** - Detailed migration status
- **`generate-remaining-migrations.sh`** - Generate remaining migrations
- **`remaining_migrations.sql`** - Generated file (after running script)

### Useful Queries:

```sql
-- Count migrations applied
SELECT COUNT(*) FROM supabase_migrations.schema_migrations;

-- List all migrations applied
SELECT version, LEFT(name, 30) as name_short
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- Check if a specific type exists
SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'mentor_status'
);

-- List all custom types
SELECT typname FROM pg_type WHERE typnamespace = (
    SELECT oid FROM pg_namespace WHERE nspname = 'public'
) AND typtype = 'e';
```

---

## What Probably Happened

Based on the error, migrations up to around `20251006092014` (or possibly earlier) were already applied when you initially ran `supabase db push`. 

The push likely succeeded for the first 18-20 migrations, then failed when trying to re-create existing types.

---

## Next Steps

1. **Run Method 1** (Automatic approach above)
2. This will apply only the missing migrations
3. Verify everything works
4. Update your `.env` file with new project credentials

---

**Last Updated**: November 30, 2025
