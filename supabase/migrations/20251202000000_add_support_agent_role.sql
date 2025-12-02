-- Add support_agent role to app_role enum
-- This must be in a separate migration from where it's used
-- Version: 1.0a
-- Date: 2025-12-02

-- Add support_agent role to existing app_role enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_agent' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'support_agent';
    END IF;
END $$;
