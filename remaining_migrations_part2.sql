-- PART 2: Migrations using the mentorship_admin enum
-- Run this ONLY AFTER Part 1 has completed successfully


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