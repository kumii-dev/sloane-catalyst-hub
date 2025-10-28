-- Add mentorship_admin role to app_role enum
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