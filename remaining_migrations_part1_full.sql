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
