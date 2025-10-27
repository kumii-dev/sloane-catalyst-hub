-- Allow users to withdraw their pending provider application

-- Drop the policy if it exists, then create it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'service_providers' 
    AND policyname = 'Users can delete their pending provider application'
  ) THEN
    DROP POLICY "Users can delete their pending provider application" ON public.service_providers;
  END IF;
END $$;

CREATE POLICY "Users can delete their pending provider application"
ON public.service_providers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND vetting_status = 'pending');

-- Allow users to delete their own pending provider role
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can delete their own pending provider role'
  ) THEN
    DROP POLICY "Users can delete their own pending provider role" ON public.user_roles;
  END IF;
END $$;

CREATE POLICY "Users can delete their own pending provider role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND role = 'software_provider_pending');