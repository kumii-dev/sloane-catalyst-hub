-- Admin RLS policies for registration approvals
-- Ensure admins can view and update providers, mentors, and funders

-- 1) Service Providers
ALTER TABLE IF EXISTS public.service_providers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_providers' AND policyname = 'Admins can view all service providers'
  ) THEN
    CREATE POLICY "Admins can view all service providers"
    ON public.service_providers
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_providers' AND policyname = 'Admins can update service providers'
  ) THEN
    CREATE POLICY "Admins can update service providers"
    ON public.service_providers
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 2) Mentors
ALTER TABLE IF EXISTS public.mentors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentors' AND policyname = 'Admins can view all mentors'
  ) THEN
    CREATE POLICY "Admins can view all mentors"
    ON public.mentors
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mentors' AND policyname = 'Admins can update mentors'
  ) THEN
    CREATE POLICY "Admins can update mentors"
    ON public.mentors
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 3) Funders (allow admin verification updates)
ALTER TABLE IF EXISTS public.funders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'funders' AND policyname = 'Admins can update funders'
  ) THEN
    CREATE POLICY "Admins can update funders"
    ON public.funders
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;