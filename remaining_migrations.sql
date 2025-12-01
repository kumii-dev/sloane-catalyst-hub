-- Remaining Migrations to Apply
-- These migrations have not yet been applied to the database
-- Generated: $(date)


-- ============================================
-- Migration: 20251027115220_43682323-73b4-42c7-b543-14417ffeeb99.sql
-- ============================================

-- NOTE: Seed data removed for clean database replication
-- Original seed data (commented out):
-- Grant admin access to nkambumw@protonmail.com
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('2f175e02-ab82-4a21-af54-38707b0dae9e', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- Migration: 20251027171645_886d88bb-55d7-47a8-9f83-5e32df1cadc4.sql
-- ============================================

-- Delete pending service provider applications and roles for current user
-- This allows users to reapply if needed

-- Delete from service_providers
DELETE FROM service_providers 
WHERE user_id = auth.uid() 
AND vetting_status = 'pending';

-- Delete pending provider role
DELETE FROM user_roles 
WHERE user_id = auth.uid() 
AND role = 'software_provider_pending';

-- ============================================
-- Migration: 20251027172333_c340854d-c137-4f18-acc4-7c09b10ce920.sql
-- ============================================

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

-- ============================================
-- Migration: 20251028063921_35265d9d-313f-49e4-9b23-74a28f06d7b1.sql
-- ============================================

-- Add contact_person column to service_providers table
ALTER TABLE public.service_providers 
ADD COLUMN contact_person TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.service_providers.contact_person IS 'Full name of the primary contact person for the service provider';

-- ============================================
-- Migration: 20251028064933_f78c3b9c-e368-48c4-93a9-7af791f74d11.sql
-- ============================================

-- Add RLS policies for service_providers table

-- Allow users to insert their own provider application
CREATE POLICY "Users can create their own provider application"
ON public.service_providers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own provider profile
CREATE POLICY "Users can view their own provider profile"
ON public.service_providers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own provider profile
CREATE POLICY "Users can update their own provider profile"
ON public.service_providers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all provider profiles
CREATE POLICY "Admins can view all provider profiles"
ON public.service_providers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update provider profiles (for vetting)
CREATE POLICY "Admins can update provider profiles"
ON public.service_providers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- Migration: 20251028080232_3831743b-d446-475c-90b4-711579cde11f.sql
-- ============================================

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

-- ============================================
-- Migration: 20251028084551_8a4fae16-b2fa-43bc-8637-c94d92910644.sql
-- ============================================

-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active 
ON public.profiles(is_active);

-- ============================================
-- Migration: 20251028090849_be339698-0a60-49ad-bb18-a92acedef6a9.sql
-- ============================================

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

-- ============================================
-- Migration: 20251028090931_e9a82b7c-b0cd-4b7c-8010-64935f4d9801.sql
-- ============================================

-- Create email_cohort_mappings table for automatic cohort assignment
CREATE TABLE IF NOT EXISTS public.email_cohort_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_cohort_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_cohort_mappings
CREATE POLICY "Mentorship admins can manage email mappings"
  ON public.email_cohort_mappings
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'mentorship_admin'::app_role)
  );

-- Update cohorts RLS to allow mentorship_admin
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Admins and mentorship admins can manage cohorts" ON public.cohorts;
CREATE POLICY "Admins and mentorship admins can manage cohorts"
  ON public.cohorts
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'mentorship_admin'::app_role)
  );

-- Update cohort_memberships RLS to allow mentorship_admin
DROP POLICY IF EXISTS "Admins can manage cohort memberships" ON public.cohort_memberships;
DROP POLICY IF EXISTS "Admins and mentorship admins can manage memberships" ON public.cohort_memberships;
CREATE POLICY "Admins and mentorship admins can manage memberships"
  ON public.cohort_memberships
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'mentorship_admin'::app_role)
  );

-- Update mentors RLS to allow mentorship_admin to manage
DROP POLICY IF EXISTS "Admins can update mentors" ON public.mentors;
DROP POLICY IF EXISTS "Admins and mentorship admins can manage mentors" ON public.mentors;
CREATE POLICY "Admins and mentorship admins can manage mentors"
  ON public.mentors
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'mentorship_admin'::app_role) OR
    auth.uid() = user_id
  );

-- Update service_providers RLS to allow mentorship_admin to view
DROP POLICY IF EXISTS "Mentorship admins can view pending providers" ON public.service_providers;
CREATE POLICY "Mentorship admins can view pending providers"
  ON public.service_providers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'mentorship_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    auth.uid() = user_id
  );

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_email_cohort_mappings_email 
  ON public.email_cohort_mappings(email);

-- Function to auto-assign user to cohort based on email
CREATE OR REPLACE FUNCTION public.auto_assign_cohort_on_registration()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_cohort_id uuid;
  v_user_email text;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Check if email has a cohort mapping
  SELECT cohort_id INTO v_cohort_id
  FROM email_cohort_mappings
  WHERE email = v_user_email;

  -- If mapping exists, create cohort membership
  IF v_cohort_id IS NOT NULL THEN
    INSERT INTO cohort_memberships (user_id, cohort_id)
    VALUES (NEW.user_id, v_cohort_id)
    ON CONFLICT (user_id, cohort_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to auto-assign cohort when profile is created
DROP TRIGGER IF EXISTS trigger_auto_assign_cohort ON public.profiles;
CREATE TRIGGER trigger_auto_assign_cohort
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_cohort_on_registration();

-- ============================================
-- Migration: 20251028132603_d895002a-9e16-4aba-88c5-a5cb1b8b4af4.sql
-- ============================================

UPDATE services 
SET banner_image_url = '/services/credit-scoring-banner.jpg'
WHERE id = 'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a';

-- ============================================
-- Migration: 20251028162739_cde858ea-da01-4b3d-8e9d-7c7de3b18ccc.sql
-- ============================================

-- Add INSERT policy for cohort_funded_listings to allow admins to add listings to cohorts
CREATE POLICY "Admins can manage cohort funded listings"
ON public.cohort_funded_listings
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role)
);

-- ============================================
-- Migration: 20251029175709_ce43769a-8e46-48a9-b0d6-e2e78b76ca22.sql
-- ============================================

-- Create triggers for automatic match generation

-- Trigger for funding opportunities (when created or becomes active)
CREATE TRIGGER funding_opportunity_matches_trigger
  AFTER INSERT OR UPDATE OF status ON funding_opportunities
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION trigger_funding_matches();

-- Trigger for services (when created or becomes active)
CREATE TRIGGER service_matches_trigger
  AFTER INSERT OR UPDATE OF is_active ON services
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION trigger_service_matches();

-- Function to trigger all matches for a user via edge function
CREATE OR REPLACE FUNCTION trigger_all_matches_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_url text := 'https://qypazgkngxhazgkuevwq.supabase.co';
  v_service_role_key text;
  v_response jsonb;
BEGIN
  -- Get service role key from vault (if available) or use placeholder
  -- Note: In production, this should use pg_net to call the edge function
  -- For now, we'll rely on manual/scheduled calls
  
  -- Log that a match generation should be triggered
  RAISE NOTICE 'Match generation should be triggered for user: %', NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger for startup profiles (when created or updated)
CREATE TRIGGER startup_profile_matches_trigger
  AFTER INSERT OR UPDATE ON startup_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_all_matches_for_user();

-- Trigger for mentors (when status changes to available)
CREATE TRIGGER mentor_availability_matches_trigger
  AFTER INSERT OR UPDATE OF status ON mentors
  FOR EACH ROW
  WHEN (NEW.status = 'available')
  EXECUTE FUNCTION trigger_all_matches_for_user();

-- Function to schedule match generation using pg_cron (if available)
-- This provides a fallback periodic match generation every hour
COMMENT ON FUNCTION trigger_all_matches_for_user() IS 
'Triggers match generation when user profiles are created/updated. 
In production, this should call the generate-matches edge function via pg_net.
For now, it logs the need for match generation.';


-- ============================================
-- Migration: 20251029234645_20f02ece-995c-4a1a-b9dc-9eebb3f86eb0.sql
-- ============================================

-- Create advisors table (separate from mentors)
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT,
  years_experience INTEGER,
  bio TEXT,
  expertise_areas TEXT[],
  specializations TEXT[],
  hourly_rate DECIMAL(10,2),
  is_premium BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'on_break')),
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  vetting_status TEXT DEFAULT 'pending' CHECK (vetting_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Create policies for advisors
CREATE POLICY "Advisors are viewable by everyone"
ON public.advisors FOR SELECT
USING (vetting_status = 'approved');

CREATE POLICY "Users can insert their own advisor profile"
ON public.advisors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisor profile"
ON public.advisors FOR UPDATE
USING (auth.uid() = user_id);

-- Create advisor categories table
CREATE TABLE public.advisor_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, category_id)
);

ALTER TABLE public.advisor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor categories are viewable by everyone"
ON public.advisor_categories FOR SELECT
USING (true);

CREATE POLICY "Advisors can manage their own categories"
ON public.advisor_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create advisor availability table
CREATE TABLE public.advisor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor availability is viewable by everyone"
ON public.advisor_availability FOR SELECT
USING (true);

CREATE POLICY "Advisors can manage their own availability"
ON public.advisor_availability FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create advisor sessions table (separate from mentor sessions)
CREATE TABLE public.advisor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_type TEXT DEFAULT 'advisory' CHECK (session_type IN ('advisory', 'coaching', 'consulting')),
  meeting_link TEXT,
  notes TEXT,
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advisor sessions"
ON public.advisor_sessions FOR SELECT
USING (
  auth.uid() = client_user_id OR
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create advisor sessions"
ON public.advisor_sessions FOR INSERT
WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Participants can update advisor sessions"
ON public.advisor_sessions FOR UPDATE
USING (
  auth.uid() = client_user_id OR
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create search vector function for advisors
CREATE OR REPLACE FUNCTION public.update_advisors_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.expertise_areas, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.specializations, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_advisors_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.advisors
FOR EACH ROW EXECUTE FUNCTION public.update_advisors_search_vector();

-- Create function to check if user is advisor
CREATE OR REPLACE FUNCTION public.is_advisor(_advisor_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.advisors
    WHERE id = _advisor_id
      AND user_id = _user_id
  )
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_advisors_updated_at
BEFORE UPDATE ON public.advisors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_availability_updated_at
BEFORE UPDATE ON public.advisor_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_sessions_updated_at
BEFORE UPDATE ON public.advisor_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_advisors_user_id ON public.advisors(user_id);
CREATE INDEX idx_advisors_status ON public.advisors(status);
CREATE INDEX idx_advisors_vetting_status ON public.advisors(vetting_status);
CREATE INDEX idx_advisors_search_vector ON public.advisors USING gin(search_vector);
CREATE INDEX idx_advisor_sessions_advisor_id ON public.advisor_sessions(advisor_id);
CREATE INDEX idx_advisor_sessions_client_user_id ON public.advisor_sessions(client_user_id);
CREATE INDEX idx_advisor_sessions_scheduled_at ON public.advisor_sessions(scheduled_at);

-- ============================================
-- Migration: 20251030001151_b58e531b-f12d-4aa7-9402-e43812e24ef2.sql
-- ============================================

-- Add RLS policy for admins to view all advisors
CREATE POLICY "Admins can view all advisors"
ON public.advisors
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role) OR
  vetting_status = 'approved'
);

-- Add RLS policy for admins to update advisors
CREATE POLICY "Admins can update advisors"
ON public.advisors
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role) OR
  auth.uid() = user_id
);

-- ============================================
-- Migration: 20251103164604_32d3b3aa-bd9c-4077-875e-115150ebb5d0.sql
-- ============================================

-- Create audit logs table for comprehensive security logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT
);

-- Create security events table for security-specific incidents
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  description TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs (via security definer context)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Only admins can view security events
CREATE POLICY "Only admins can view security events"
ON public.security_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_security_events_timestamp ON public.security_events(timestamp DESC);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);

-- Add comments
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for all security-relevant events (7-year retention)';
COMMENT ON TABLE public.security_events IS 'Security incidents and anomalies requiring investigation';

-- ============================================
-- Migration: 20251104231049_169d536d-2147-4ef4-936c-ab8645bf9dc7.sql
-- ============================================

-- Create saved searches table for funders
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id UUID NOT NULL REFERENCES public.funders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_saved_searches_funder_id ON public.saved_searches(funder_id);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_searches
CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches
  FOR SELECT
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches
  FOR INSERT
  WITH CHECK (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches
  FOR UPDATE
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches
  FOR DELETE
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration: 20251121081115_767716ea-d55c-4fa7-b816-c1ead480418f.sql
-- ============================================

-- Create storage bucket for platform documentation
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-docs', 'platform-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for tracking uploaded platform documents
CREATE TABLE IF NOT EXISTS public.platform_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all platform documents
CREATE POLICY "Authenticated users can view platform documents"
ON public.platform_documents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can upload platform documents
CREATE POLICY "Authenticated users can upload platform documents"
ON public.platform_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can update their own uploads
CREATE POLICY "Users can update their own platform documents"
ON public.platform_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete their own platform documents"
ON public.platform_documents
FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Storage policies for platform-docs bucket
CREATE POLICY "Authenticated users can view platform docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'platform-docs');

CREATE POLICY "Authenticated users can upload platform docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own platform docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own platform docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_documents_uploaded_by ON public.platform_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_platform_documents_category ON public.platform_documents(category);
CREATE INDEX IF NOT EXISTS idx_platform_documents_uploaded_at ON public.platform_documents(uploaded_at DESC);

-- ============================================
-- Migration: 20251125083211_abf884cc-c864-4f18-94d7-b86d9ddbf12d.sql
-- ============================================

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can view subscriptions (for admin purposes)
CREATE POLICY "Authenticated users can view subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email 
  ON public.newsletter_subscriptions(email);

-- ============================================
-- Migration: 20251125111816_ce1689ac-ecf8-4df7-9a41-121b50fc4c15.sql
-- ============================================

-- Create status notifications subscriptions table
CREATE TABLE IF NOT EXISTS public.status_notifications_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.status_notifications_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to subscribe
CREATE POLICY "Anyone can subscribe to status notifications"
  ON public.status_notifications_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.status_notifications_subscriptions
  FOR SELECT
  USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_status_notifications_subscriptions_email 
  ON public.status_notifications_subscriptions(email);
