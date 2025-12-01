-- PART 1: Add enum value only
-- Run this FIRST and wait for it to complete before running Part 2

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'mentorship_admin' 
    AND enumtypid = 'app_role'::regtype
  ) THEN
    ALTER TYPE app_role ADD VALUE 'mentorship_admin';
  END IF;
END $$;

-- Stop here. This must be committed before using the new enum value.
-- After this completes successfully, run remaining_migrations_part2.sql
