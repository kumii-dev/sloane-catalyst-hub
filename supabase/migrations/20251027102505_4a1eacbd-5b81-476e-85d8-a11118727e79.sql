-- Create security definer functions for common RLS checks

-- Check if user owns a startup profile
CREATE OR REPLACE FUNCTION public.is_startup_owner(_startup_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.startup_profiles
    WHERE id = _startup_id
      AND user_id = _user_id
  )
$$;

-- Check if user is a mentor
CREATE OR REPLACE FUNCTION public.is_mentor(_mentor_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mentors
    WHERE id = _mentor_id
      AND user_id = _user_id
  )
$$;

-- Check if user is a service provider
CREATE OR REPLACE FUNCTION public.is_service_provider(_provider_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.service_providers
    WHERE id = _provider_id
      AND user_id = _user_id
  )
$$;

-- Check if user is a funder
CREATE OR REPLACE FUNCTION public.is_funder(_funder_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.funders
    WHERE id = _funder_id
      AND user_id = _user_id
  )
$$;

-- Check if user owns a listing
CREATE OR REPLACE FUNCTION public.is_listing_owner(_listing_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND provider_id = _user_id
  )
$$;

-- Check if user is in a cohort
CREATE OR REPLACE FUNCTION public.is_cohort_member(_cohort_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cohort_memberships
    WHERE cohort_id = _cohort_id
      AND user_id = _user_id
      AND is_active = true
  )
$$;

-- Check if user is funder for opportunity
CREATE OR REPLACE FUNCTION public.is_opportunity_funder(_opportunity_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.funding_opportunities fo
    JOIN public.funders f ON f.id = fo.funder_id
    WHERE fo.id = _opportunity_id
      AND f.user_id = _user_id
  )
$$;

-- Update RLS policies to use security definer functions

-- funding_matches policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.funding_matches;
CREATE POLICY "Users can view their own matches"
ON public.funding_matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM startup_profiles 
    WHERE id = funding_matches.startup_id 
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own matches" ON public.funding_matches;
CREATE POLICY "Users can update their own matches"
ON public.funding_matches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM startup_profiles 
    WHERE id = funding_matches.startup_id 
    AND user_id = auth.uid()
  )
);

-- services policies
DROP POLICY IF EXISTS "Approved providers can manage their services" ON public.services;
CREATE POLICY "Approved providers can manage their services"
ON public.services
FOR ALL
USING (
  is_service_provider(provider_id, auth.uid())
  AND EXISTS (
    SELECT 1 FROM service_providers 
    WHERE id = services.provider_id 
    AND vetting_status = 'approved'
  )
);

-- user_subscriptions policies
DROP POLICY IF EXISTS "Providers can view their listing subscriptions" ON public.user_subscriptions;
CREATE POLICY "Providers can view their listing subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (
  is_listing_owner(listing_id, auth.uid())
);

-- funding_applications policies
DROP POLICY IF EXISTS "Funders can view applications to their opportunities" ON public.funding_applications;
CREATE POLICY "Funders can view applications to their opportunities"
ON public.funding_applications
FOR SELECT
USING (
  is_opportunity_funder(opportunity_id, auth.uid())
);

DROP POLICY IF EXISTS "Funders can update applications to their opportunities" ON public.funding_applications;
CREATE POLICY "Funders can update applications to their opportunities"
ON public.funding_applications
FOR UPDATE
USING (
  is_opportunity_funder(opportunity_id, auth.uid())
);

-- mentor_availability policies
DROP POLICY IF EXISTS "Mentors can manage their availability" ON public.mentor_availability;
CREATE POLICY "Mentors can manage their availability"
ON public.mentor_availability
FOR ALL
USING (
  is_mentor(mentor_id, auth.uid())
);

-- mentor_date_overrides policies
DROP POLICY IF EXISTS "Mentors can manage their date overrides" ON public.mentor_date_overrides;
CREATE POLICY "Mentors can manage their date overrides"
ON public.mentor_date_overrides
FOR ALL
USING (
  is_mentor(mentor_id, auth.uid())
);

-- cohort_funded_listings policies
DROP POLICY IF EXISTS "Cohort funded listings viewable by members" ON public.cohort_funded_listings;
CREATE POLICY "Cohort funded listings viewable by members"
ON public.cohort_funded_listings
FOR SELECT
USING (
  is_active = true
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_cohort_member(cohort_id, auth.uid())
  )
);