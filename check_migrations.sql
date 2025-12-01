-- Query to Check Which Migrations Have Been Applied
-- Run this in Supabase SQL Editor first

-- Step 1: Check if schema_migrations table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'supabase_migrations' 
    AND table_name = 'schema_migrations'
) AS migrations_table_exists;

-- Step 2: If true, check which migrations have been applied
SELECT 
    version,
    name,
    statements
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC
LIMIT 20;

-- Step 3: Count total migrations applied
SELECT COUNT(*) as total_migrations_applied 
FROM supabase_migrations.schema_migrations;

-- Instructions:
-- 1. Run the queries above
-- 2. Note the LAST migration version number (most recent)
-- 3. Use the script below to generate only the remaining migrations
