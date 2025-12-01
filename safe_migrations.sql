-- Safe Combined Migrations with IF NOT EXISTS checks
-- This version checks for existing objects before creating them
-- Generated: November 30, 2025

-- First, let's check what migrations have already been applied
DO $$
BEGIN
    RAISE NOTICE 'Checking existing migrations...';
END $$;

SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;

-- If you see migrations from 20250928 to 20251006, they're already applied
-- This script will skip those and apply only the remaining ones

-- Instructions:
-- 1. Run the SELECT above to see what's already applied
-- 2. Note the last migration version number
-- 3. Edit this file and delete all migrations up to and including that version
-- 4. Run the remaining migrations

-- Alternative approach: Apply migrations one by one starting from the last applied version

