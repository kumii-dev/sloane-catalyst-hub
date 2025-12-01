-- PART 2: Use the new enum value
-- Run this ONLY AFTER Part 1 has completed successfully

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

-- Continue with remaining migrations...

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

-- Continue with all remaining migrations from 20251029175709 onwards...
