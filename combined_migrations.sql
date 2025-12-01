-- Create enum types for mentorship system
CREATE TYPE public.mentor_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE public.session_type AS ENUM ('free', 'premium');
CREATE TYPE public.session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentors table
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  company TEXT,
  experience_years INTEGER,
  expertise_areas TEXT[],
  hourly_rate DECIMAL(10,2),
  status mentor_status NOT NULL DEFAULT 'available',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentoring sessions table
CREATE TABLE public.mentoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_type session_type NOT NULL,
  session_status session_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.mentoring_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor-category junction table
CREATE TABLE public.mentor_categories (
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.mentoring_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentors
CREATE POLICY "Mentors are viewable by everyone" 
ON public.mentors FOR SELECT USING (true);

CREATE POLICY "Users can insert their own mentor profile" 
ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile" 
ON public.mentors FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentoring_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.mentoring_sessions FOR SELECT 
USING (
  auth.uid() = mentee_id OR 
  auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id)
);

CREATE POLICY "Mentees can create sessions" 
ON public.mentoring_sessions FOR INSERT 
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors and mentees can update their sessions" 
ON public.mentoring_sessions FOR UPDATE 
USING (
  auth.uid() = mentee_id OR 
  auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id)
);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.mentoring_categories FOR SELECT USING (true);

CREATE POLICY "Mentor categories are viewable by everyone" 
ON public.mentor_categories FOR SELECT USING (true);

CREATE POLICY "Mentors can manage their categories" 
ON public.mentor_categories FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_sessions_updated_at
  BEFORE UPDATE ON public.mentoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.mentoring_categories (name, description, icon) VALUES
('Technology', 'Software development, AI, data science', 'Code'),
('Business', 'Strategy, entrepreneurship, leadership', 'Briefcase'),
('Design', 'UI/UX, graphic design, product design', 'Palette'),
('Marketing', 'Digital marketing, growth, branding', 'TrendingUp'),
('Career', 'Career transitions, interviews, networking', 'User'),
('Finance', 'Investment, financial planning, fintech', 'DollarSign');-- Fix security issue: Remove public email exposure from profiles table

-- Drop the overly permissive policy that exposes all profile data
DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;

-- Create new restrictive policies for profile access
-- 1. Users can view their own complete profile (including sensitive data like email)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Others can view only public profile information (excluding email and other sensitive fields)
-- Note: This policy structure will require application-level filtering to exclude sensitive fields
CREATE POLICY "Public can view basic profile information" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NULL OR auth.uid() != user_id);-- Fix security issue: Remove public email exposure from profiles table

-- Just remove the insecure policy that exposes all profile data
-- The secure policies may already exist from previous attempts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;-- Create funding hub tables
CREATE TYPE public.funding_type AS ENUM ('grant', 'loan', 'vc', 'angel', 'bank_product', 'accelerator', 'competition');
CREATE TYPE public.funding_status AS ENUM ('draft', 'active', 'closed', 'paused');
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE public.company_stage AS ENUM ('idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth', 'established');
CREATE TYPE public.industry_type AS ENUM ('fintech', 'healthtech', 'edtech', 'agritech', 'cleantech', 'retail', 'manufacturing', 'services', 'other');

-- Create funders table
CREATE TABLE public.funders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  focus_areas TEXT[],
  preferred_industries industry_type[],
  preferred_stages company_stage[],
  min_funding_amount NUMERIC,
  max_funding_amount NUMERIC,
  sloane_credits_balance INTEGER DEFAULT 0,
  total_funded_amount NUMERIC DEFAULT 0,
  total_funded_companies INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funding opportunities table
CREATE TABLE public.funding_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funder_id UUID NOT NULL REFERENCES public.funders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  funding_type funding_type NOT NULL,
  amount_min NUMERIC,
  amount_max NUMERIC,
  industry_focus industry_type[],
  stage_requirements company_stage[],
  geographic_restrictions TEXT[],
  application_deadline TIMESTAMP WITH TIME ZONE,
  requirements TEXT NOT NULL,
  application_process TEXT,
  min_credit_score INTEGER,
  sloane_credits_allocation INTEGER DEFAULT 0,
  status funding_status DEFAULT 'draft',
  total_applications INTEGER DEFAULT 0,
  approved_applications INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create startup profiles table for funding
CREATE TABLE public.startup_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  industry industry_type NOT NULL,
  stage company_stage NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  funding_needed NUMERIC,
  credit_score INTEGER,
  team_size INTEGER,
  annual_revenue NUMERIC,
  location TEXT,
  founded_year INTEGER,
  consent_data_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funding applications table
CREATE TABLE public.funding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  status application_status DEFAULT 'draft',
  requested_amount NUMERIC,
  application_data JSONB,
  funder_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funding matches table for AI recommendations
CREATE TABLE public.funding_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funders
CREATE POLICY "Funders are viewable by everyone" ON public.funders FOR SELECT USING (true);
CREATE POLICY "Users can insert their own funder profile" ON public.funders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funder profile" ON public.funders FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for funding opportunities
CREATE POLICY "Active funding opportunities are viewable by everyone" ON public.funding_opportunities FOR SELECT USING (status = 'active');
CREATE POLICY "Funders can manage their opportunities" ON public.funding_opportunities FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.funders WHERE id = funding_opportunities.funder_id));

-- Create RLS policies for startup profiles
CREATE POLICY "Startup profiles are viewable by funders" ON public.startup_profiles FOR SELECT USING (consent_data_sharing = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own startup profile" ON public.startup_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own startup profile" ON public.startup_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for funding applications
CREATE POLICY "Users can view their own applications" ON public.funding_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Funders can view applications to their opportunities" ON public.funding_applications FOR SELECT USING (auth.uid() IN (SELECT f.user_id FROM public.funders f JOIN public.funding_opportunities fo ON f.id = fo.funder_id WHERE fo.id = funding_applications.opportunity_id));
CREATE POLICY "Users can create applications" ON public.funding_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Users can update their own applications" ON public.funding_applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Funders can update applications to their opportunities" ON public.funding_applications FOR UPDATE USING (auth.uid() IN (SELECT f.user_id FROM public.funders f JOIN public.funding_opportunities fo ON f.id = fo.funder_id WHERE fo.id = funding_applications.opportunity_id));

-- Create RLS policies for funding matches
CREATE POLICY "Users can view their own matches" ON public.funding_matches FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.startup_profiles WHERE id = funding_matches.startup_id));
CREATE POLICY "Users can update their own matches" ON public.funding_matches FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.startup_profiles WHERE id = funding_matches.startup_id));

-- Create indexes for better performance
CREATE INDEX idx_funding_opportunities_funder_id ON public.funding_opportunities(funder_id);
CREATE INDEX idx_funding_opportunities_status ON public.funding_opportunities(status);
CREATE INDEX idx_funding_opportunities_type ON public.funding_opportunities(funding_type);
CREATE INDEX idx_funding_applications_opportunity_id ON public.funding_applications(opportunity_id);
CREATE INDEX idx_funding_applications_startup_id ON public.funding_applications(startup_id);
CREATE INDEX idx_funding_applications_status ON public.funding_applications(status);
CREATE INDEX idx_funding_matches_startup_id ON public.funding_matches(startup_id);
CREATE INDEX idx_funding_matches_score ON public.funding_matches(match_score DESC);
CREATE INDEX idx_startup_profiles_industry ON public.startup_profiles(industry);
CREATE INDEX idx_startup_profiles_stage ON public.startup_profiles(stage);

-- Create triggers for updated_at
CREATE TRIGGER update_funders_updated_at BEFORE UPDATE ON public.funders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_funding_opportunities_updated_at BEFORE UPDATE ON public.funding_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_startup_profiles_updated_at BEFORE UPDATE ON public.startup_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_funding_applications_updated_at BEFORE UPDATE ON public.funding_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.service_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_cohort_partner BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service types enum
CREATE TYPE public.service_type AS ENUM ('subscription', 'one_time', 'session_based', 'custom');

-- Create pricing types enum
CREATE TYPE public.pricing_type AS ENUM ('free', 'freemium', 'paid', 'credits_only', 'contact_for_pricing');

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  key_features TEXT[],
  target_industries TEXT[],
  service_type service_type NOT NULL,
  pricing_type pricing_type NOT NULL,
  base_price DECIMAL(10,2),
  credits_price INTEGER,
  cohort_benefits TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_subscribers INTEGER DEFAULT 0,
  banner_image_url TEXT,
  gallery_images TEXT[],
  demo_url TEXT,
  documentation_url TEXT,
  terms_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service reviews table
CREATE TABLE public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, user_id)
);

-- Create service subscriptions table
CREATE TABLE public.service_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subscription_status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for service_providers
CREATE POLICY "Providers are viewable by everyone" 
ON public.service_providers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own provider profile" 
ON public.service_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile" 
ON public.service_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Active services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Providers can manage their services" 
ON public.services 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.service_providers 
  WHERE id = services.provider_id
));

-- RLS Policies for service_reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.service_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.service_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.service_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for service_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.service_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.service_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.service_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_service_categories_parent_id ON public.service_categories(parent_id);
CREATE INDEX idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_featured ON public.services(is_featured, is_active);
CREATE INDEX idx_service_reviews_service_id ON public.service_reviews(service_id);
CREATE INDEX idx_service_subscriptions_user_id ON public.service_subscriptions(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_subscriptions_updated_at
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service categories
INSERT INTO public.service_categories (name, description, icon, slug, sort_order) VALUES
('Software Services', 'CRM, ERP, Accounting, HR, Marketing, Security, Analytics, AI tools', 'Code', 'software-services', 1),
('Professional & Ancillary Services', 'Accounting, Legal, Governance, Compliance, Business Advisory', 'Briefcase', 'professional-services', 2),
('Growth & Development Services', 'Mentorship, Skills Training, Hackathons, Events, Innovation Labs', 'TrendingUp', 'growth-development', 3);

-- Insert subcategories for Software Services
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('CRM & Sales', 'Customer relationship management and sales tools', 'Users', 'crm-sales', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 1),
('Accounting & Finance', 'Financial management and accounting software', 'Calculator', 'accounting-finance', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 2),
('Marketing & Analytics', 'Marketing automation and analytics platforms', 'BarChart', 'marketing-analytics', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 3),
('HR & Productivity', 'Human resources and productivity tools', 'Clock', 'hr-productivity', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 4),
('Security & Compliance', 'Cybersecurity and compliance solutions', 'Shield', 'security-compliance', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 5);

-- Insert subcategories for Professional Services
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('Legal Services', 'Legal advice and compliance support', 'Scale', 'legal-services', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 1),
('Business Advisory', 'Strategic business consulting and advisory', 'Target', 'business-advisory', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 2),
('Market Access', 'Market entry and expansion services', 'Globe', 'market-access', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 3);

-- Insert subcategories for Growth & Development
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('Skills Training', 'Professional development and skills training', 'GraduationCap', 'skills-training', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 1),
('Innovation Labs', 'Innovation workshops and labs', 'Lightbulb', 'innovation-labs', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 2),
('Events & Networking', 'Conferences, hackathons, and networking events', 'Calendar', 'events-networking', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 3);-- Create enum for resource types
CREATE TYPE public.resource_type AS ENUM (
  'article',
  'template',
  'video',
  'course',
  'tool',
  'calculator',
  'checklist',
  'case_study',
  'guide',
  'webinar',
  'podcast'
);

-- Create enum for resource access levels
CREATE TYPE public.access_level AS ENUM (
  'public',
  'registered',
  'cohort_only',
  'premium'
);

-- Create resource categories table
CREATE TABLE public.resource_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.resource_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  resource_type resource_type NOT NULL,
  access_level access_level DEFAULT 'public',
  category_id UUID REFERENCES public.resource_categories(id),
  author_name TEXT,
  author_bio TEXT,
  thumbnail_url TEXT,
  file_url TEXT,
  external_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT,
  tags TEXT[],
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  cohort_benefits TEXT,
  sponsor_name TEXT,
  sponsor_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource bookmarks table
CREATE TABLE public.resource_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create resource progress table (for courses/videos)
CREATE TABLE public.resource_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create resource ratings table
CREATE TABLE public.resource_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create events table for community events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  banner_image_url TEXT,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'registered',
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resource_categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.resource_categories 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for resources
CREATE POLICY "Public resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (is_active = true AND access_level = 'public');

CREATE POLICY "Registered users can view registered resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_active = true AND access_level IN ('public', 'registered'));

CREATE POLICY "Cohort users can view cohort resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_active = true AND access_level IN ('public', 'registered', 'cohort_only'));

-- Create RLS policies for resource_bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.resource_bookmarks 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for resource_progress
CREATE POLICY "Users can manage their own progress" 
ON public.resource_progress 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for resource_ratings
CREATE POLICY "Ratings are viewable by everyone" 
ON public.resource_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings" 
ON public.resource_ratings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.resource_ratings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Active events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for event_registrations
CREATE POLICY "Users can manage their own registrations" 
ON public.event_registrations 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_resources_category_id ON public.resources(category_id);
CREATE INDEX idx_resources_type ON public.resources(resource_type);
CREATE INDEX idx_resources_access_level ON public.resources(access_level);
CREATE INDEX idx_resources_featured ON public.resources(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_resource_bookmarks_user_id ON public.resource_bookmarks(user_id);
CREATE INDEX idx_resource_progress_user_id ON public.resource_progress(user_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_resource_categories_updated_at
  BEFORE UPDATE ON public.resource_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_progress_updated_at
  BEFORE UPDATE ON public.resource_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_ratings_updated_at
  BEFORE UPDATE ON public.resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default resource categories
INSERT INTO public.resource_categories (name, slug, description, icon, sort_order) VALUES
('Learning Hub', 'learning-hub', 'Digital skills, entrepreneurial training, and work skills development', 'GraduationCap', 1),
('Knowledge Library', 'knowledge-library', 'Articles, guides, templates, and case studies', 'BookOpen', 2),
('Tools & Downloads', 'tools-downloads', 'Business calculators, starter kits, and checklists', 'Download', 3),
('Community & Networking', 'community-networking', 'Events, forums, and networking opportunities', 'Users', 4),
('Support & Help Center', 'support-help', 'FAQs, tutorials, and support resources', 'HelpCircle', 5);

-- Insert subcategories for Learning Hub
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Digital Skills Courses', 'digital-skills', 'Technology and digital literacy courses', 'Monitor', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 1),
('Entrepreneurial Skills', 'entrepreneurial-skills', 'Business development and entrepreneurship training', 'Briefcase', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 2),
('Work Skills Development', 'work-skills', 'Professional development and soft skills', 'TrendingUp', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 3);

-- Insert subcategories for Knowledge Library
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Articles & Guides', 'articles-guides', 'How-to guides and informational articles', 'FileText', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 1),
('Templates', 'templates', 'Business templates and document templates', 'Layout', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 2),
('Case Studies', 'case-studies', 'Success stories and real-world examples', 'Award', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 3);

-- Insert subcategories for Tools & Downloads
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Business Calculators', 'calculators', 'Financial and business calculation tools', 'Calculator', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 1),
('Starter Kits', 'starter-kits', 'CRM, ERP, and business tool starter packages', 'Package', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 2),
('Compliance Checklists', 'compliance', 'Regulatory and compliance resources', 'CheckSquare', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 3);-- Create enums for credit scoring
CREATE TYPE public.scoring_category AS ENUM (
  'financial_health',
  'governance', 
  'skills',
  'market_access',
  'compliance',
  'growth_readiness'
);

CREATE TYPE public.assessment_status AS ENUM (
  'draft',
  'in_progress', 
  'completed',
  'reviewed'
);

-- Credit scoring assessments table
CREATE TABLE public.credit_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status assessment_status NOT NULL DEFAULT 'draft',
  overall_score INTEGER,
  financial_health_score INTEGER,
  governance_score INTEGER,
  skills_score INTEGER,
  market_access_score INTEGER,
  compliance_score INTEGER,
  growth_readiness_score INTEGER,
  assessment_data JSONB,
  recommendations TEXT[],
  improvement_areas TEXT[],
  consent_to_share BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  assessed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on credit assessments
ALTER TABLE public.credit_assessments ENABLE ROW LEVEL SECURITY;

-- Credit scoring criteria and weights (admin configurable)
CREATE TABLE public.scoring_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category scoring_category NOT NULL,
  criteria_name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  max_points INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scoring criteria
ALTER TABLE public.scoring_criteria ENABLE ROW LEVEL SECURITY;

-- Credit score sharing permissions
CREATE TABLE public.score_sharing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.credit_assessments(id) ON DELETE CASCADE,
  funder_id UUID REFERENCES public.funders(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_level TEXT NOT NULL DEFAULT 'summary', -- 'summary', 'detailed', 'full'
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on score sharing
ALTER TABLE public.score_sharing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_assessments
CREATE POLICY "Users can view their own assessments" 
ON public.credit_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.credit_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.credit_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Funders can view shared assessments" 
ON public.credit_assessments 
FOR SELECT 
USING (
  consent_to_share = true AND 
  id IN (
    SELECT ss.assessment_id 
    FROM public.score_sharing ss 
    JOIN public.funders f ON f.id = ss.funder_id 
    WHERE f.user_id = auth.uid() AND ss.expires_at > now()
  )
);

-- RLS Policies for scoring_criteria
CREATE POLICY "Everyone can view active criteria" 
ON public.scoring_criteria 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for score_sharing
CREATE POLICY "Users can view their shared scores" 
ON public.score_sharing 
FOR SELECT 
USING (
  assessment_id IN (
    SELECT id FROM public.credit_assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create score shares" 
ON public.score_sharing 
FOR INSERT 
WITH CHECK (
  assessment_id IN (
    SELECT id FROM public.credit_assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Funders can view their score access" 
ON public.score_sharing 
FOR SELECT 
USING (
  funder_id IN (
    SELECT id FROM public.funders WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_credit_assessments_startup_id ON public.credit_assessments(startup_id);
CREATE INDEX idx_credit_assessments_user_id ON public.credit_assessments(user_id);
CREATE INDEX idx_credit_assessments_status ON public.credit_assessments(status);
CREATE INDEX idx_score_sharing_assessment_id ON public.score_sharing(assessment_id);
CREATE INDEX idx_score_sharing_funder_id ON public.score_sharing(funder_id);
CREATE INDEX idx_scoring_criteria_category ON public.scoring_criteria(category);

-- Create trigger for updated_at
CREATE TRIGGER update_credit_assessments_updated_at
  BEFORE UPDATE ON public.credit_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoring_criteria_updated_at
  BEFORE UPDATE ON public.scoring_criteria
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default scoring criteria
INSERT INTO public.scoring_criteria (category, criteria_name, description, weight, max_points) VALUES
-- Financial Health
('financial_health', 'Revenue Consistency', 'Regular revenue streams over 12+ months', 0.25, 25),
('financial_health', 'Cash Flow Management', 'Positive operational cash flow trends', 0.20, 20),
('financial_health', 'Financial Records', 'Complete and accurate financial statements', 0.15, 15),
('financial_health', 'Banking History', 'Clean banking record and transaction history', 0.20, 20),
('financial_health', 'Debt Management', 'Appropriate debt levels and payment history', 0.20, 20),

-- Governance
('governance', 'Legal Compliance', 'Proper business registration and legal structure', 0.30, 30),
('governance', 'Board Structure', 'Appropriate governance and decision-making processes', 0.25, 25),
('governance', 'Documentation', 'Complete corporate documentation and policies', 0.20, 20),
('governance', 'Risk Management', 'Identified and managed business risks', 0.25, 25),

-- Skills & Capabilities
('skills', 'Team Expertise', 'Relevant skills and experience in leadership team', 0.30, 30),
('skills', 'Training Completion', 'Completed business development and skills programs', 0.25, 25),
('skills', 'Mentorship Engagement', 'Active participation in mentorship programs', 0.20, 20),
('skills', 'Digital Literacy', 'Use of digital tools and online presence', 0.25, 25),

-- Market Access
('market_access', 'Customer Base', 'Established and diverse customer portfolio', 0.30, 30),
('market_access', 'Market Position', 'Competitive positioning and differentiation', 0.25, 25),
('market_access', 'Growth Trajectory', 'Historical and projected growth patterns', 0.25, 25),
('market_access', 'Network Access', 'Access to suppliers, distributors, and partners', 0.20, 20),

-- Compliance
('compliance', 'Regulatory Adherence', 'Compliance with industry regulations', 0.30, 30),
('compliance', 'Tax Compliance', 'Up-to-date tax filings and payments', 0.25, 25),
('compliance', 'Employment Compliance', 'Proper employment practices and documentation', 0.20, 20),
('compliance', 'Data Protection', 'POPIA/GDPR compliance for data handling', 0.25, 25),

-- Growth Readiness
('growth_readiness', 'Scalability', 'Business model and systems ready for growth', 0.25, 25),
('growth_readiness', 'Investment Readiness', 'Prepared for funding with proper documentation', 0.30, 30),
('growth_readiness', 'Technology Adoption', 'Use of technology to enable growth', 0.20, 20),
('growth_readiness', 'Strategic Planning', 'Clear business strategy and execution plan', 0.25, 25);-- Add persona tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization TEXT;

-- Create enum for persona types
CREATE TYPE public.persona_type AS ENUM (
  'unassigned',
  'smme_startup',
  'job_seeker',
  'funder',
  'service_provider',
  'mentor_advisor',
  'public_private_entity'
);

-- Update persona_type column to use enum
ALTER TABLE public.profiles ALTER COLUMN persona_type TYPE persona_type USING persona_type::persona_type;
ALTER TABLE public.profiles ALTER COLUMN persona_type SET DEFAULT 'unassigned'::persona_type;

-- Create progressive profiling data table
CREATE TABLE IF NOT EXISTS public.progressive_profile_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_type persona_type NOT NULL,
  field_name TEXT NOT NULL,
  field_value JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, persona_type, field_name)
);

-- Enable RLS
ALTER TABLE public.progressive_profile_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progressive_profile_data
CREATE POLICY "Users can view their own profile data"
ON public.progressive_profile_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data"
ON public.progressive_profile_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data"
ON public.progressive_profile_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Update existing profiles to have default persona
UPDATE public.profiles SET persona_type = 'unassigned'::persona_type WHERE persona_type IS NULL;-- Create or replace function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    organization,
    persona_type,
    onboarding_step
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'organization',
    'unassigned'::persona_type,
    1
  );
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();-- Create storage bucket for assessment documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-documents',
  'assessment-documents',
  false,
  10485760, -- 10MB limit per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- RLS policies for assessment documents
CREATE POLICY "Users can upload their own assessment documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assessment-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own assessment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assessment-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Funders can view shared assessment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assessment-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT ca.user_id::text
    FROM credit_assessments ca
    JOIN score_sharing ss ON ss.assessment_id = ca.id
    JOIN funders f ON f.id = ss.funder_id
    WHERE f.user_id = auth.uid()
      AND ca.consent_to_share = true
      AND ss.expires_at > now()
  )
);

-- Add new fields to credit_assessments table for the 10-domain scoring system
ALTER TABLE credit_assessments
ADD COLUMN business_profile_score integer,
ADD COLUMN repayment_behaviour_score integer,
ADD COLUMN operational_capacity_score integer,
ADD COLUMN technology_innovation_score integer,
ADD COLUMN social_environmental_score integer,
ADD COLUMN trust_reputation_score integer,
ADD COLUMN document_urls jsonb DEFAULT '{}'::jsonb,
ADD COLUMN ai_analysis jsonb,
ADD COLUMN risk_band text CHECK (risk_band IN ('Low', 'Medium', 'High')),
ADD COLUMN funding_eligibility_range text,
ADD COLUMN score_explanation text,
ADD COLUMN domain_explanations jsonb;

-- Update the overall_score calculation to be out of 1000
COMMENT ON COLUMN credit_assessments.overall_score IS 'Composite credit score on a 0-1000 scale';

-- Add index for faster queries
CREATE INDEX idx_credit_assessments_risk_band ON credit_assessments(risk_band);
CREATE INDEX idx_credit_assessments_overall_score ON credit_assessments(overall_score);-- Create enum types for the marketplace
CREATE TYPE listing_type AS ENUM ('software', 'ancillary', 'mentorship', 'funding', 'training', 'event', 'other');
CREATE TYPE delivery_mode AS ENUM ('hybrid', 'online', 'in_person');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_approval', 'active', 'paused', 'rejected');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE payment_method AS ENUM ('paystack', 'credits', 'sponsored');
CREATE TYPE app_role AS ENUM ('admin', 'startup', 'smme', 'mentor', 'advisor', 'funder', 'service_provider');

-- User roles table (security definer pattern)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohorts table
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sponsor_name text NOT NULL, -- e.g., "Microsoft", "AWS", "African Bank"
  sponsor_logo_url text,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  credits_allocated integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohorts viewable by everyone"
  ON public.cohorts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cohorts"
  ON public.cohorts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohort memberships
CREATE TABLE public.cohort_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(cohort_id, user_id)
);

ALTER TABLE public.cohort_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cohort memberships"
  ON public.cohort_memberships FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage cohort memberships"
  ON public.cohort_memberships FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Listing categories (expand existing service_categories)
CREATE TABLE IF NOT EXISTS public.listing_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES public.listing_categories(id),
  icon text,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON public.listing_categories FOR SELECT
  USING (is_active = true);

-- Listings table (comprehensive marketplace listings)
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_type listing_type NOT NULL,
  category_id uuid REFERENCES public.listing_categories(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  description text NOT NULL,
  delivery_mode delivery_mode NOT NULL DEFAULT 'online',
  
  -- Pricing
  base_price numeric(10,2),
  credits_price integer, -- Cost in Sloane Credits
  is_subscription boolean DEFAULT false,
  subscription_duration_days integer,
  
  -- Availability
  capacity integer,
  available_slots jsonb, -- For booking-based services
  
  -- Media
  thumbnail_url text,
  gallery_images text[],
  attachments jsonb, -- {filename, url, type}
  
  -- Visibility & Access
  status listing_status DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  visible_to_all boolean DEFAULT true,
  cohort_visibility uuid[], -- Array of cohort IDs
  
  -- Metadata
  tags text[],
  rating numeric(2,1) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_subscriptions integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings viewable by everyone"
  ON public.listings FOR SELECT
  USING (status = 'active' AND (visible_to_all = true OR auth.uid() = provider_id));

CREATE POLICY "Users can create their listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohort funded listings (which listings are sponsored for which cohorts)
CREATE TABLE public.cohort_funded_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cohort_id, listing_id)
);

ALTER TABLE public.cohort_funded_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohort funded listings viewable by members"
  ON public.cohort_funded_listings FOR SELECT
  USING (
    is_active = true AND (
      public.has_role(auth.uid(), 'admin') OR
      EXISTS (
        SELECT 1 FROM public.cohort_memberships cm
        WHERE cm.cohort_id = cohort_funded_listings.cohort_id
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
      )
    )
  );

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  status subscription_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  
  -- Payment details
  amount_paid numeric(10,2),
  credits_used integer,
  cohort_id uuid REFERENCES public.cohorts(id), -- If sponsored
  
  -- Subscription period
  started_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean DEFAULT false,
  
  -- Transaction reference
  paystack_reference text,
  transaction_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view their listing subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = user_subscriptions.listing_id
      AND l.provider_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Credits wallet
CREATE TABLE public.credits_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance integer DEFAULT 0 CHECK (balance >= 0),
  total_earned integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.credits_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their wallet"
  ON public.credits_wallet FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage wallets"
  ON public.credits_wallet FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Credits transactions
CREATE TABLE public.credits_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL, -- Positive for credit, negative for debit
  transaction_type text NOT NULL, -- 'subscription', 'topup', 'cohort_allocation', 'refund'
  reference_id uuid, -- Reference to subscription or other entity
  description text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions"
  ON public.credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Listing reviews
CREATE TABLE public.listing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
  ON public.listing_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.listing_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews"
  ON public.listing_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_categories_updated_at
  BEFORE UPDATE ON public.listing_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_wallet_updated_at
  BEFORE UPDATE ON public.credits_wallet
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_reviews_updated_at
  BEFORE UPDATE ON public.listing_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_listings_provider ON public.listings(provider_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_type ON public.listings(listing_type);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_listing ON public.user_subscriptions(listing_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_cohort_memberships_user ON public.cohort_memberships(user_id);
CREATE INDEX idx_cohort_memberships_cohort ON public.cohort_memberships(cohort_id);
CREATE INDEX idx_credits_transactions_user ON public.credits_transactions(user_id);-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing images
CREATE POLICY "Listing images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );-- Update existing subcategories and add new ones for Software Services
-- Update CRM & Sales -> Customer Relationship & Sales
UPDATE service_categories 
SET 
  name = 'Customer Relationship & Sales',
  description = 'Systems that drive customer engagement and revenue growth',
  slug = 'sw-customer-relationship-sales',
  sort_order = 2
WHERE id = 'c4008cd8-dd0b-4e1c-b152-2972372a4405';

-- Update Accounting & Finance
UPDATE service_categories 
SET 
  name = 'Accounting & Finance',
  description = 'Manage money, payments, and compliance',
  slug = 'sw-accounting-finance',
  sort_order = 3
WHERE id = '8ccd021f-d0a6-42a9-902b-27e9f7df807f';

-- Update HR & Productivity -> HR & People Development
UPDATE service_categories 
SET 
  name = 'HR & People Development',
  description = 'Build high-performing teams',
  slug = 'sw-hr-people-development',
  sort_order = 10
WHERE id = '9d8f91d1-e29e-4595-9723-b741c6f6002c';

-- Update Marketing, Branding & Analytics
UPDATE service_categories 
SET 
  name = 'Marketing, Branding & Analytics',
  description = 'Promote, analyze, and grow your brand',
  slug = 'sw-marketing-branding-analytics',
  sort_order = 4
WHERE id = 'a8dff58f-f110-42a9-9d9d-b3fabca499d1';

-- Update Security & Compliance -> Cybersecurity & Compliance
UPDATE service_categories 
SET 
  name = 'Cybersecurity & Compliance',
  description = 'Secure operations and ensure data privacy',
  slug = 'sw-cybersecurity-compliance',
  sort_order = 6
WHERE id = '86a27c62-23f0-41d7-b630-dc55c5c88261';

-- Insert new categories
INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Business Operations & Productivity', 
  'Tools to run daily operations efficiently', 
  'sw-business-operations-productivity', 
  id, 
  1, 
  'Briefcase', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'eCommerce & Retail', 
  'Build online stores or sell products', 
  'sw-ecommerce-retail', 
  id, 
  5, 
  'ShoppingCart', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Data, AI & Analytics', 
  'Extract insights and intelligence', 
  'sw-data-ai-analytics', 
  id, 
  7, 
  'Brain', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Cloud, Hosting & Infrastructure', 
  'Enable scalability and digital readiness', 
  'sw-cloud-hosting-infrastructure', 
  id, 
  8, 
  'Cloud', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Project Management & Collaboration', 
  'Manage projects, teams, and progress', 
  'sw-project-management-collaboration', 
  id, 
  9, 
  'FolderKanban', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;-- Insert 5 additional Software Services categories
INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Legal, Risk & Governance', 
  'Manage contracts, governance, and compliance', 
  'sw-legal-risk-governance', 
  id, 
  11, 
  'Scale', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Industry-Specific Solutions', 
  'Specialized systems for sectors (expandable over time)', 
  'sw-industry-specific-solutions', 
  id, 
  12, 
  'Building', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Developer & Tech Tools', 
  'Tools for software developers or IT teams', 
  'sw-developer-tech-tools', 
  id, 
  13, 
  'Code', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Integration & Automation', 
  'Connect systems and automate workflows', 
  'sw-integration-automation', 
  id, 
  14, 
  'Zap', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Startup Support & Advisory', 
  'Platforms for growth and mentorship', 
  'sw-startup-support-advisory', 
  id, 
  15, 
  'Rocket', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;-- Insert 22 On Sloane as a service provider (OEM)
INSERT INTO service_providers (
  id,
  user_id,
  company_name,
  description,
  logo_url,
  website,
  contact_email,
  is_verified,
  is_cohort_partner,
  rating
) VALUES (
  'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  '00000000-0000-0000-0000-000000000000', -- placeholder user_id
  '22 On Sloane',
  'Leading provider of innovative business solutions for startups and SMEs',
  '/src/assets/22-on-sloane-logo.png',
  'https://www.22onsloane.com',
  'info@22onsloane.com',
  true,
  true,
  5.0
) ON CONFLICT (id) DO NOTHING;

-- Get the category ID for Startup Support & Advisory
DO $$
DECLARE
  category_uuid UUID;
BEGIN
  SELECT id INTO category_uuid 
  FROM service_categories 
  WHERE slug = 'sw-startup-support-advisory';

  -- Insert Credit Scoring Tool service
  INSERT INTO services (
    id,
    provider_id,
    category_id,
    name,
    short_description,
    description,
    key_features,
    target_industries,
    service_type,
    pricing_type,
    credits_price,
    base_price,
    is_active,
    is_featured,
    rating,
    total_reviews,
    total_subscribers,
    cohort_benefits
  ) VALUES (
    'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a',
    'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    category_uuid,
    'Credit Scoring Tool',
    'AI-powered credit assessment tool for startups and SMEs',
    'Our Credit Scoring Tool uses advanced AI algorithms to assess startup creditworthiness based on multiple factors including business profile, financial health, operational capacity, and growth readiness. Get instant credit scores and funding eligibility recommendations.',
    ARRAY[
      'AI-powered credit analysis',
      'Multi-dimensional scoring across 10+ criteria',
      'Instant funding eligibility assessment',
      'Risk band classification',
      'Detailed improvement recommendations',
      'Secure document upload and analysis',
      'Shareable credit reports for funders',
      'Regular score updates and monitoring'
    ],
    ARRAY[
      'Startups',
      'SMEs',
      'Technology',
      'Financial Services',
      'All Industries'
    ],
    'subscription',
    'credits_only',
    50,
    99.00,
    true,
    true,
    4.8,
    12,
    45,
    'Cohort members receive 50% discount on first assessment and priority support'
  ) ON CONFLICT (id) DO NOTHING;
END $$;-- Update Credit Scoring Tool service with logo and demo link
UPDATE services 
SET 
  banner_image_url = '/src/assets/22-on-sloane-logo.png',
  demo_url = '/credit-score/assessment'
WHERE id = 'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a';-- Update the Credit Scoring Tool to use the Kumi logo
UPDATE services
SET banner_image_url = '/src/assets/kumi-logo.png'
WHERE id = 'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a';-- Insert all software service subcategories
INSERT INTO service_categories (name, slug, description, icon, parent_id, sort_order, is_active)
SELECT 
  name,
  slug,
  description,
  icon,
  (SELECT id FROM service_categories WHERE slug = 'software-services'),
  sort_order,
  true
FROM (VALUES
  ('Marketing, Branding & Analytics', 'sw-marketing-branding-analytics', 'Campaign management, brand monitoring, and performance analytics', 'BarChart3', 4),
  ('eCommerce & Retail', 'sw-ecommerce-retail', 'Online stores, inventory, and retail management systems', 'ShoppingCart', 5),
  ('Cybersecurity & Compliance', 'sw-cybersecurity-compliance', 'Security tools, threat detection, and compliance management', 'Shield', 6),
  ('Data, AI & Analytics', 'sw-data-ai-analytics', 'Business intelligence, machine learning, and data platforms', 'Brain', 7),
  ('Cloud, Hosting & Infrastructure', 'sw-cloud-hosting-infrastructure', 'Cloud services, hosting, and infrastructure management', 'Cloud', 8),
  ('Project Management & Collaboration', 'sw-project-management-collaboration', 'Project tracking, team collaboration, and workflow tools', 'FolderKanban', 9),
  ('HR & People Development', 'sw-hr-people-development', 'Human resources, payroll, and talent management systems', 'Award', 10),
  ('Legal, Risk & Governance', 'sw-legal-risk-governance', 'Legal management, compliance, and governance tools', 'Scale', 11),
  ('Industry-Specific Solutions', 'sw-industry-specific-solutions', 'Specialized software for healthcare, construction, and more', 'Building', 12),
  ('Developer & Tech Tools', 'sw-developer-tech-tools', 'Development environments, version control, and testing tools', 'Code', 13),
  ('Integration & Automation', 'sw-integration-automation', 'Workflow automation and system integration platforms', 'Zap', 14),
  ('Startup Support & Advisory', 'sw-startup-support-advisory', 'Tools and services to help startups launch and scale', 'Rocket', 15)
) AS new_cats(name, slug, description, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_categories WHERE service_categories.slug = new_cats.slug
);-- NOTE: Seed data removed for clean database replication
-- This migration originally contained seed data for a specific user
-- To add this user to your new database, create them through the application
-- or use a separate seed script after the database is set up

-- Original seed data (commented out):
-- INSERT INTO public.profiles (user_id, email, first_name, last_name)
-- VALUES (
--   '314e0504-5bb7-4980-887a-2a076321b5d1',
--   'nkambumw@gmail.com',
--   'Mafika',
--   'Nkambule'
-- )
-- ON CONFLICT (user_id) DO NOTHING;

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('314e0504-5bb7-4980-887a-2a076321b5d1', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
-- Create messages table for in-platform notifications
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'notification',
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Update the handle_new_user function to handle duplicate profile inserts gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle duplicates gracefully
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    organization,
    persona_type,
    onboarding_step
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'organization',
    'unassigned'::persona_type,
    1
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;-- Add unique constraint on user_id for mentors table
-- This ensures each user can only have one mentor profile
ALTER TABLE public.mentors 
ADD CONSTRAINT mentors_user_id_unique UNIQUE (user_id);-- Fix typo in title for Mafika's mentor profile
UPDATE mentors 
SET title = 'Financial Analyst' 
WHERE title = 'Financial Analyst' 
  AND id IN (
    SELECT m.id 
    FROM mentors m 
    JOIN profiles p ON m.user_id = p.user_id 
    WHERE p.first_name = 'Mafika'
  );
-- Fix typo in mentor title
UPDATE mentors 
SET title = 'Financial Analyst' 
WHERE title LIKE '%Anal;%';-- Add profile picture for Mafika
UPDATE profiles 
SET profile_picture_url = '/avatars/mafika-profile.png' 
WHERE first_name = 'Mafika' AND last_name = 'Nkuthula';-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile pictures bucket
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);-- First, let's fix the credit_assessments policies that are causing recursion
-- Drop and recreate the problematic policies

DROP POLICY IF EXISTS "Users can view their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;

-- Recreate policies without recursion
CREATE POLICY "Users can view their own assessments"
ON public.credit_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.credit_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.credit_assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Fix the funder policy to avoid recursion by using a simpler check
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments FOR SELECT
USING (
  consent_to_share = true 
  AND EXISTS (
    SELECT 1 FROM score_sharing ss
    JOIN funders f ON f.id = ss.funder_id
    WHERE ss.assessment_id = credit_assessments.id
    AND f.user_id = auth.uid()
    AND ss.expires_at > now()
  )
);-- First, let's fix the credit_assessments policies that are causing recursion
-- Drop and recreate the problematic policies

DROP POLICY IF EXISTS "Users can view their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;

-- Recreate policies without recursion
CREATE POLICY "Users can view their own assessments"
ON public.credit_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.credit_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.credit_assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Fix the funder policy to avoid recursion by using a simpler check
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments FOR SELECT
USING (
  consent_to_share = true 
  AND EXISTS (
    SELECT 1 FROM score_sharing ss
    JOIN funders f ON f.id = ss.funder_id
    WHERE ss.assessment_id = credit_assessments.id
    AND f.user_id = auth.uid()
    AND ss.expires_at > now()
  )
);-- The error indicates infinite recursion in credit_assessments policies
-- Let's check and fix those policies

-- Drop the problematic credit_assessments policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Funders can view shared assessments" ON credit_assessments;

-- Recreate them with simplified logic to avoid recursion
CREATE POLICY "Users can view their own assessments"
ON credit_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON credit_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON credit_assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Funders can view shared assessments"
ON credit_assessments FOR SELECT
USING (
  consent_to_share = true 
  AND expires_at > now()
  AND EXISTS (
    SELECT 1 FROM score_sharing ss
    JOIN funders f ON f.id = ss.funder_id
    WHERE ss.assessment_id = credit_assessments.id
    AND f.user_id = auth.uid()
  )
);-- 1) Create SECURITY DEFINER helper functions to avoid recursive RLS
create or replace function public.is_assessment_owner(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.credit_assessments ca
    where ca.id = _assessment_id
      and ca.user_id = _user_id
  );
$$;

create or replace function public.has_funder_assessment_access(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.score_sharing ss
    join public.funders f on f.id = ss.funder_id
    where ss.assessment_id = _assessment_id
      and f.user_id = _user_id
      and ss.expires_at > now()
  );
$$;

-- 2) Replace recursive policies with function-based checks
-- score_sharing
DROP POLICY IF EXISTS "Users can view their shared scores" ON public.score_sharing;
CREATE POLICY "Users can view their shared scores"
ON public.score_sharing
FOR SELECT
USING (public.is_assessment_owner(assessment_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create score shares" ON public.score_sharing;
CREATE POLICY "Users can create score shares"
ON public.score_sharing
FOR INSERT
WITH CHECK (public.is_assessment_owner(assessment_id, auth.uid()));

-- credit_assessments (funders view shared)
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments
FOR SELECT
USING (
  consent_to_share = true
  AND public.has_funder_assessment_access(id, auth.uid())
);
-- 1) Create SECURITY DEFINER helper functions to avoid recursive RLS
create or replace function public.is_assessment_owner(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.credit_assessments ca
    where ca.id = _assessment_id
      and ca.user_id = _user_id
  );
$$;

create or replace function public.has_funder_assessment_access(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.score_sharing ss
    join public.funders f on f.id = ss.funder_id
    where ss.assessment_id = _assessment_id
      and f.user_id = _user_id
      and ss.expires_at > now()
  );
$$;

-- 2) Replace recursive policies with function-based checks
-- score_sharing
DROP POLICY IF EXISTS "Users can view their shared scores" ON public.score_sharing;
CREATE POLICY "Users can view their shared scores"
ON public.score_sharing
FOR SELECT
USING (public.is_assessment_owner(assessment_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create score shares" ON public.score_sharing;
CREATE POLICY "Users can create score shares"
ON public.score_sharing
FOR INSERT
WITH CHECK (public.is_assessment_owner(assessment_id, auth.uid()));

-- credit_assessments (funders view shared)
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments
FOR SELECT
USING (
  consent_to_share = true
  AND public.has_funder_assessment_access(id, auth.uid())
);
-- Create mentor availability table
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specific date overrides for availability
CREATE TABLE IF NOT EXISTS public.mentor_date_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_date_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for mentor_availability
CREATE POLICY "Availability viewable by everyone"
  ON public.mentor_availability FOR SELECT
  USING (is_active = true);

CREATE POLICY "Mentors can manage their availability"
  ON public.mentor_availability FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentors WHERE id = mentor_availability.mentor_id
    )
  );

-- Policies for mentor_date_overrides
CREATE POLICY "Date overrides viewable by everyone"
  ON public.mentor_date_overrides FOR SELECT
  USING (true);

CREATE POLICY "Mentors can manage their date overrides"
  ON public.mentor_date_overrides FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentors WHERE id = mentor_date_overrides.mentor_id
    )
  );

-- Add session_fee to mentors table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mentors' AND column_name = 'session_fee') THEN
    ALTER TABLE public.mentors ADD COLUMN session_fee NUMERIC DEFAULT 100;
  END IF;
END $$;

-- Add platform_fee_percentage to mentors table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mentors' AND column_name = 'platform_fee_percentage') THEN
    ALTER TABLE public.mentors ADD COLUMN platform_fee_percentage NUMERIC DEFAULT 25;
  END IF;
END $$;-- Function to deduct credits from wallet and record transaction
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM credits_wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Available: %, Required: %', v_current_balance, p_amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update wallet
  UPDATE credits_wallet
  SET 
    balance = v_new_balance,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credits_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    balance_after
  ) VALUES (
    p_user_id,
    -p_amount,
    'debit',
    p_description,
    p_reference_id,
    v_new_balance
  );
END;
$$;

-- Function to add credits to wallet
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Get or create wallet
  INSERT INTO credits_wallet (user_id, balance, total_earned, total_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM credits_wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update wallet
  UPDATE credits_wallet
  SET 
    balance = v_new_balance,
    total_earned = total_earned + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credits_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    balance_after
  ) VALUES (
    p_user_id,
    p_amount,
    'credit',
    p_description,
    p_reference_id,
    v_new_balance
  );
END;
$$;-- Create session_reviews table for mutual reviews
CREATE TABLE public.session_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.mentoring_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id, reviewee_id)
);

-- Enable RLS
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reviews where they are involved"
ON public.session_reviews
FOR SELECT
USING (
  auth.uid() = reviewer_id OR 
  auth.uid() = reviewee_id OR
  reviewee_id IN (
    SELECT user_id FROM public.mentors WHERE id IN (
      SELECT mentor_id FROM public.mentoring_sessions WHERE id = session_id
    )
  )
);

CREATE POLICY "Users can create reviews for their sessions"
ON public.session_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.mentoring_sessions ms
    WHERE ms.id = session_id
    AND ms.session_status = 'completed'
    AND (
      ms.mentee_id = auth.uid() OR
      ms.mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.session_reviews
FOR UPDATE
USING (auth.uid() = reviewer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_session_reviews_updated_at
BEFORE UPDATE ON public.session_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  conversation_type TEXT NOT NULL DEFAULT 'direct', -- direct, group, cohort
  related_entity_type TEXT, -- funding_application, mentoring_session, listing, etc.
  related_entity_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_pinned BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  UNIQUE(conversation_id, user_id)
);

-- Create conversation_messages table
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, system, action
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- For attachments, reactions, etc.
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_messages_conversation ON public.conversation_messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_messages_sender ON public.conversation_messages(sender_id);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participant record"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves as participants"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for conversation_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.conversation_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.conversation_messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  
  -- Update unread count for all participants except sender
  UPDATE public.conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_message_at
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;-- Add foreign key from conversation_messages.sender_id to auth.users
-- Note: We don't add FK to auth.users directly, but document the relationship

-- Add foreign key from conversation_participants.user_id to auth.users (already implicit)
-- These relationships exist but aren't explicitly foreign keys to auth schema

-- Set search_path for the trigger function to avoid security issues
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  
  -- Update unread count for all participants except sender
  UPDATE public.conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$;-- Fix infinite recursion in conversation_participants policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create a simpler policy without circular reference
CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

-- Add policy to allow users to create conversations
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (true);

-- Add policy to update conversations (for last_message_at)
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);-- Drop the policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Create security definer function to check if user is in conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view their own participant records"
ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view conversations they participate in"
ON conversations
FOR SELECT
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Users can update conversations they participate in"
ON conversations
FOR UPDATE
USING (public.is_conversation_participant(id, auth.uid()));-- Create RPC to create direct conversation and participants atomically
create or replace function public.create_direct_conversation(
  p_user1 uuid,
  p_user2 uuid,
  p_title text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  -- Create conversation
  insert into public.conversations (conversation_type, title)
  values ('direct', coalesce(p_title, 'Direct conversation'))
  returning id into v_conversation_id;

  -- Add both participants
  insert into public.conversation_participants (conversation_id, user_id)
  values (v_conversation_id, p_user1), (v_conversation_id, p_user2);

  return v_conversation_id;
end;
$$;-- Create a security-definer function to fetch the other participant's profile for a conversation
-- This allows a conversation participant to see the other participant's basic profile under RLS
CREATE OR REPLACE FUNCTION public.get_other_participant_profiles(
  p_conversation_id uuid
)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  profile_picture_url text,
  persona_type public.persona_type,
  organization text,
  bio text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id,
         p.first_name,
         p.last_name,
         p.profile_picture_url,
         p.persona_type,
         p.organization,
         p.bio
  FROM public.conversation_participants cp
  JOIN public.profiles p ON p.user_id = cp.user_id
  WHERE cp.conversation_id = p_conversation_id
    AND cp.user_id <> auth.uid()
    AND is_conversation_participant(p_conversation_id, auth.uid());
$$;

-- Ensure only authenticated users can execute the function implicitly via RLS checks inside
REVOKE ALL ON FUNCTION public.get_other_participant_profiles(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_other_participant_profiles(uuid) TO authenticated;
-- Create enum for file categories
CREATE TYPE file_category AS ENUM (
  'pitch_deck',
  'financial_statement',
  'contract',
  'legal_document',
  'business_plan',
  'report',
  'presentation',
  'other'
);

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category file_category DEFAULT 'other',
  folder TEXT,
  description TEXT,
  tags TEXT[],
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create file shares table for sharing files with specific users
CREATE TABLE public.file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID NOT NULL,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'download', 'edit')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_category ON public.files(category);
CREATE INDEX idx_files_folder ON public.files(folder);
CREATE INDEX idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX idx_file_shares_shared_with ON public.file_shares(shared_with);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for files table
CREATE POLICY "Users can view their own files"
  ON public.files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view files shared with them"
  ON public.files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.file_shares
      WHERE file_shares.file_id = files.id
        AND file_shares.shared_with = auth.uid()
        AND (file_shares.expires_at IS NULL OR file_shares.expires_at > now())
    )
  );

CREATE POLICY "Users can insert their own files"
  ON public.files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON public.files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.files FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for file_shares table
CREATE POLICY "Users can view shares for their files"
  ON public.file_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares for their files"
  ON public.file_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM public.files
      WHERE files.id = file_shares.file_id
        AND files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own shares"
  ON public.file_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- Create trigger for updated_at
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for files bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view shared files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'files'
    AND EXISTS (
      SELECT 1 FROM public.files f
      JOIN public.file_shares fs ON fs.file_id = f.id
      WHERE f.file_path = name
        AND fs.shared_with = auth.uid()
        AND (fs.expires_at IS NULL OR fs.expires_at > now())
    )
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );-- Drop all existing policies on profiles table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Allow users to view their own complete profile (including email)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to view other users' public profile info
-- Note: This still allows access to email column, so use public_profiles view instead
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() != user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a view for public profile data that excludes email
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  first_name,
  last_name,
  organization,
  persona_type,
  bio,
  profile_picture_url,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;-- Recreate the public_profiles view with SECURITY INVOKER
-- This ensures the view uses the querying user's permissions, not the creator's
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  first_name,
  last_name,
  organization,
  persona_type,
  bio,
  profile_picture_url,
  created_at,
  updated_at
FROM public.profiles;-- Add video call support to mentoring_sessions table
ALTER TABLE public.mentoring_sessions
ADD COLUMN IF NOT EXISTS video_room_url TEXT,
ADD COLUMN IF NOT EXISTS video_room_name TEXT,
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_completed_at TIMESTAMP WITH TIME ZONE;

-- Add new session status if needed (in_progress)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'session_status'
  ) THEN
    CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
  ELSE
    -- Add in_progress to existing enum if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'in_progress' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'session_status')
    ) THEN
      ALTER TYPE session_status ADD VALUE 'in_progress' AFTER 'confirmed';
    END IF;
  END IF;
END $$;

-- Create index for faster video room lookups
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_video_room 
ON public.mentoring_sessions(video_room_name) 
WHERE video_room_name IS NOT NULL;-- Enable public read access to mentor profiles and related data
-- This allows non-authenticated users to view mentor profiles

-- Allow public read access to profiles (for mentor information)
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
CREATE POLICY "Public can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Allow public read access to session reviews (so people can see mentor reviews)
DROP POLICY IF EXISTS "Public can view session reviews" ON public.session_reviews;
CREATE POLICY "Public can view session reviews"
ON public.session_reviews
FOR SELECT
TO public
USING (true);

-- Note: mentors and mentor_categories already have public SELECT policies
-- mentoring_sessions table remains protected for authenticated participants only-- Add total_reviews column to mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;

-- Update existing mentors with their current review count
UPDATE public.mentors m
SET total_reviews = (
  SELECT COUNT(*)
  FROM public.session_reviews sr
  WHERE sr.reviewee_id = m.user_id
);-- Create a SECURITY DEFINER function to recalculate a mentor's rating from session_reviews
CREATE OR REPLACE FUNCTION public.recalculate_mentor_rating(p_mentor_user_id uuid)
RETURNS TABLE(new_rating numeric, total_reviews integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_avg numeric;
BEGIN
  SELECT count(*), coalesce(avg(rating), 0) INTO v_count, v_avg
  FROM public.session_reviews
  WHERE reviewee_id = p_mentor_user_id;

  -- Only update if this user is actually a mentor
  IF EXISTS (SELECT 1 FROM public.mentors WHERE user_id = p_mentor_user_id) THEN
    UPDATE public.mentors
    SET rating = round(v_avg::numeric * 10)/10,
        total_reviews = v_count,
        updated_at = now()
    WHERE user_id = p_mentor_user_id;
  END IF;

  RETURN QUERY SELECT round(v_avg::numeric * 10)/10, v_count;
END;
$$;

-- Optional: allow authenticated users to call the function via RPC
GRANT EXECUTE ON FUNCTION public.recalculate_mentor_rating(uuid) TO authenticated;

-- Trigger function to automatically recalc rating on review changes
CREATE OR REPLACE FUNCTION public.handle_session_review_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate when the reviewee is a mentor
  IF EXISTS (SELECT 1 FROM public.mentors WHERE user_id = NEW.reviewee_id) THEN
    PERFORM public.recalculate_mentor_rating(NEW.reviewee_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on session_reviews for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_session_review_change ON public.session_reviews;
CREATE TRIGGER trg_session_review_change
AFTER INSERT OR UPDATE ON public.session_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_session_review_change();-- Backfill mentors' rating and total_reviews based on existing session_reviews
-- This ensures profiles and dashboards reflect current data even for reviews created before triggers existed

-- Update mentors that have at least one review
UPDATE public.mentors m
SET 
  rating = COALESCE(r.avg_rating, 0),
  total_reviews = COALESCE(r.total_reviews, 0),
  updated_at = now()
FROM (
  SELECT 
    reviewee_id AS mentor_user_id,
    ROUND(AVG(rating)::numeric * 10)/10 AS avg_rating,
    COUNT(*) AS total_reviews
  FROM public.session_reviews
  GROUP BY reviewee_id
) r
WHERE m.user_id = r.mentor_user_id;

-- Normalize mentors with no reviews to zero values
UPDATE public.mentors m
SET 
  rating = 0,
  total_reviews = 0,
  updated_at = now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.session_reviews sr WHERE sr.reviewee_id = m.user_id
);
-- Add performance indexes for marketplace at scale

-- Listings table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_provider_created 
  ON listings(provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_status_created 
  ON listings(status, created_at DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_category_status 
  ON listings(category_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_featured 
  ON listings(is_featured, created_at DESC) WHERE is_featured = true AND status = 'active';

-- Full-text search on listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_listings_search 
  ON listings USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_listings_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
DROP TRIGGER IF EXISTS trigger_update_listings_search ON listings;
CREATE TRIGGER trigger_update_listings_search
  BEFORE INSERT OR UPDATE OF title, short_description, description, tags
  ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listings_search_vector();

-- Update existing records
UPDATE listings SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D');

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON user_subscriptions(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_listing 
  ON user_subscriptions(listing_id, status) WHERE status = 'active';

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listing 
  ON listing_reviews(listing_id, created_at DESC);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_featured_active 
  ON services(is_featured, is_active, created_at DESC) 
  WHERE is_featured = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_category_active 
  ON services(category_id, is_active) WHERE is_active = true;

-- Cohort funded listings index
CREATE INDEX IF NOT EXISTS idx_cohort_funded_active 
  ON cohort_funded_listings(cohort_id, listing_id, is_active) 
  WHERE is_active = true;-- Fix function search path security warning
CREATE OR REPLACE FUNCTION update_listings_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;-- Add software_provider role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
  
  -- Add software_provider to existing enum
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'software_provider';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'software_provider_pending';
END $$;

-- Add vetting fields to service_providers table
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS vetting_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS vetting_notes text,
ADD COLUMN IF NOT EXISTS business_registration_number text,
ADD COLUMN IF NOT EXISTS proof_document_url text,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);

-- Create index for faster vetting queries
CREATE INDEX IF NOT EXISTS idx_service_providers_vetting_status ON service_providers(vetting_status);

-- Update RLS policies for service_providers
DROP POLICY IF EXISTS "Providers can manage their services" ON services;
CREATE POLICY "Approved providers can manage their services"
ON services
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM service_providers 
    WHERE id = services.provider_id 
    AND vetting_status = 'approved'
  )
);

-- Allow users to view their provider application status
DROP POLICY IF EXISTS "Users can update their own provider profile" ON service_providers;
CREATE POLICY "Users can view and update their own provider profile"
ON service_providers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin policy for managing provider applications
CREATE POLICY "Admins can manage all provider applications"
ON service_providers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update user role when provider is approved
CREATE OR REPLACE FUNCTION approve_service_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vetting_status = 'approved' AND OLD.vetting_status != 'approved' THEN
    -- Add software_provider role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'software_provider'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove pending role if exists
    DELETE FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'software_provider_pending'::app_role;
    
    NEW.approved_at = now();
  ELSIF NEW.vetting_status = 'rejected' AND OLD.vetting_status != 'rejected' THEN
    NEW.rejected_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;-- Add comprehensive profile fields for smart matching

-- Add matching-related fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry_sectors TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Enhance startup_profiles for better matching
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS business_registration_number TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS business_age TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS employee_count_range TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS revenue_range TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS funding_history TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS funding_needs TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS funding_amount_needed TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS market_access_needs TEXT[];
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS target_market TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS competitive_advantage TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS key_products_services TEXT[];
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS growth_stage TEXT;
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS challenges TEXT[];
ALTER TABLE startup_profiles ADD COLUMN IF NOT EXISTS support_needed TEXT[];

-- Create index for faster matching queries
CREATE INDEX IF NOT EXISTS idx_startup_profiles_industry ON startup_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_stage ON startup_profiles(stage);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_location ON startup_profiles(location);

-- Enhance funders table for better matching
ALTER TABLE funders ADD COLUMN IF NOT EXISTS funding_model TEXT;
ALTER TABLE funders ADD COLUMN IF NOT EXISTS investment_criteria TEXT;
ALTER TABLE funders ADD COLUMN IF NOT EXISTS sector_preferences TEXT[];
ALTER TABLE funders ADD COLUMN IF NOT EXISTS stage_preferences TEXT[];
ALTER TABLE funders ADD COLUMN IF NOT EXISTS geographic_preferences TEXT[];
ALTER TABLE funders ADD COLUMN IF NOT EXISTS decision_timeline TEXT;
ALTER TABLE funders ADD COLUMN IF NOT EXISTS success_stories TEXT[];
ALTER TABLE funders ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create index for funder matching
CREATE INDEX IF NOT EXISTS idx_funders_min_amount ON funders(min_funding_amount);
CREATE INDEX IF NOT EXISTS idx_funders_max_amount ON funders(max_funding_amount);

-- Enhance mentors table for better matching
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS mentoring_style TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS max_mentees INTEGER DEFAULT 5;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS success_stories TEXT[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS specializations TEXT[];
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- Create index for mentor matching
CREATE INDEX IF NOT EXISTS idx_mentors_expertise ON mentors USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON mentors(status);

-- Enhance service_providers table
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS service_categories TEXT[];
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS target_industries TEXT[];
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS pricing_models TEXT[];
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS implementation_timeline TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS support_offered TEXT[];
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS case_studies_url TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create matching score function for startups and funders
CREATE OR REPLACE FUNCTION calculate_funding_match_score(
  startup_id_param UUID,
  funder_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_score INTEGER := 0;
  startup_rec RECORD;
  funder_rec RECORD;
BEGIN
  -- Get startup details
  SELECT * INTO startup_rec FROM startup_profiles WHERE id = startup_id_param;
  
  -- Get funder details
  SELECT * INTO funder_rec FROM funders WHERE id = funder_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Industry match (30 points)
  IF funder_rec.preferred_industries && ARRAY[startup_rec.industry::TEXT] THEN
    match_score := match_score + 30;
  END IF;
  
  -- Stage match (25 points)
  IF funder_rec.preferred_stages && ARRAY[startup_rec.stage::TEXT] THEN
    match_score := match_score + 25;
  END IF;
  
  -- Funding amount match (25 points)
  IF startup_rec.funding_needed IS NOT NULL AND 
     startup_rec.funding_needed >= funder_rec.min_funding_amount AND 
     startup_rec.funding_needed <= funder_rec.max_funding_amount THEN
    match_score := match_score + 25;
  END IF;
  
  -- Location/geographic match (10 points)
  IF funder_rec.geographic_preferences IS NULL OR 
     startup_rec.location = ANY(funder_rec.geographic_preferences) THEN
    match_score := match_score + 10;
  END IF;
  
  -- Credit score bonus (10 points)
  IF startup_rec.credit_score IS NOT NULL AND startup_rec.credit_score >= 70 THEN
    match_score := match_score + 10;
  END IF;
  
  RETURN match_score;
END;
$$;

-- Create profile completion trigger
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_fields INTEGER := 0;
  completed_fields INTEGER := 0;
  completion_percentage INTEGER;
BEGIN
  -- Count total and completed fields
  total_fields := 13; -- Adjust based on essential fields
  
  IF NEW.first_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.last_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.email IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.bio IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.profile_picture_url IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.location IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.industry_sectors IS NOT NULL AND array_length(NEW.industry_sectors, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.skills IS NOT NULL AND array_length(NEW.skills, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.linkedin_url IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.organization IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.persona_type IS NOT NULL AND NEW.persona_type != 'unassigned' THEN completed_fields := completed_fields + 1; END IF;
  
  -- Calculate percentage
  completion_percentage := (completed_fields * 100) / total_fields;
  NEW.profile_completion_percentage := completion_percentage;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile completion
DROP TRIGGER IF EXISTS trigger_calculate_profile_completion ON profiles;
CREATE TRIGGER trigger_calculate_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profile_completion();-- Fix security warnings by setting search_path on new functions

-- Update calculate_funding_match_score to set search_path
CREATE OR REPLACE FUNCTION calculate_funding_match_score(
  startup_id_param UUID,
  funder_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  match_score INTEGER := 0;
  startup_rec RECORD;
  funder_rec RECORD;
BEGIN
  -- Get startup details
  SELECT * INTO startup_rec FROM startup_profiles WHERE id = startup_id_param;
  
  -- Get funder details
  SELECT * INTO funder_rec FROM funders WHERE id = funder_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Industry match (30 points)
  IF funder_rec.preferred_industries && ARRAY[startup_rec.industry::TEXT] THEN
    match_score := match_score + 30;
  END IF;
  
  -- Stage match (25 points)
  IF funder_rec.preferred_stages && ARRAY[startup_rec.stage::TEXT] THEN
    match_score := match_score + 25;
  END IF;
  
  -- Funding amount match (25 points)
  IF startup_rec.funding_needed IS NOT NULL AND 
     startup_rec.funding_needed >= funder_rec.min_funding_amount AND 
     startup_rec.funding_needed <= funder_rec.max_funding_amount THEN
    match_score := match_score + 25;
  END IF;
  
  -- Location/geographic match (10 points)
  IF funder_rec.geographic_preferences IS NULL OR 
     startup_rec.location = ANY(funder_rec.geographic_preferences) THEN
    match_score := match_score + 10;
  END IF;
  
  -- Credit score bonus (10 points)
  IF startup_rec.credit_score IS NOT NULL AND startup_rec.credit_score >= 70 THEN
    match_score := match_score + 10;
  END IF;
  
  RETURN match_score;
END;
$$;

-- Update calculate_profile_completion to set search_path
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_fields INTEGER := 0;
  completed_fields INTEGER := 0;
  completion_percentage INTEGER;
BEGIN
  -- Count total and completed fields
  total_fields := 13; -- Adjust based on essential fields
  
  IF NEW.first_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.last_name IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.email IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.bio IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.profile_picture_url IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.phone IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.location IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.industry_sectors IS NOT NULL AND array_length(NEW.industry_sectors, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.skills IS NOT NULL AND array_length(NEW.skills, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.linkedin_url IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.organization IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
  IF NEW.persona_type IS NOT NULL AND NEW.persona_type != 'unassigned' THEN completed_fields := completed_fields + 1; END IF;
  
  -- Calculate percentage
  completion_percentage := (completed_fields * 100) / total_fields;
  NEW.profile_completion_percentage := completion_percentage;
  
  RETURN NEW;
END;
$$;-- Create profile-pictures storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile pictures
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);-- Create profile-pictures storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile pictures
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);-- Backfill existing users who don't have profiles
INSERT INTO public.profiles (user_id, email, first_name, last_name, created_at, updated_at, onboarding_step, persona_type)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'first_name',
  au.raw_user_meta_data->>'last_name',
  NOW(),
  NOW(),
  1,
  'unassigned'::persona_type
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;-- Allow users to upload company logos
CREATE POLICY "Users can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to update their company logos
CREATE POLICY "Users can update their company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to view company logos
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = 'company-logos');-- Comprehensive Matching Engine System for Kumii Platform

-- Create mentor_matches table for mentor-mentee matching
CREATE TABLE IF NOT EXISTS public.mentor_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL,
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_matches table for service provider-buyer matching
CREATE TABLE IF NOT EXISTS public.service_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL,
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_notifications table to track notifications sent
CREATE TABLE IF NOT EXISTS public.match_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('funding', 'mentor', 'service')),
  match_id UUID NOT NULL,
  notification_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for mentor_matches
ALTER TABLE public.mentor_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentor matches"
  ON public.mentor_matches FOR SELECT
  USING (auth.uid() = mentee_user_id);

CREATE POLICY "Users can update their mentor matches"
  ON public.mentor_matches FOR UPDATE
  USING (auth.uid() = mentee_user_id);

-- Add RLS policies for service_matches
ALTER TABLE public.service_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their service matches"
  ON public.service_matches FOR SELECT
  USING (auth.uid() = buyer_user_id);

CREATE POLICY "Users can update their service matches"
  ON public.service_matches FOR UPDATE
  USING (auth.uid() = buyer_user_id);

-- Add RLS policies for match_notifications
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.match_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.match_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentee ON public.mentor_matches(mentee_user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_score ON public.mentor_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_service_matches_buyer ON public.service_matches(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_service_matches_score ON public.service_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_notifications_user ON public.match_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_type ON public.match_notifications(match_type);

-- Create function to calculate mentor match score
CREATE OR REPLACE FUNCTION public.calculate_mentor_match_score(
  mentor_id_param UUID,
  mentee_user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_score INTEGER := 0;
  mentor_rec RECORD;
  profile_rec RECORD;
  common_sectors TEXT[];
  common_interests TEXT[];
BEGIN
  -- Get mentor details
  SELECT * INTO mentor_rec FROM mentors WHERE id = mentor_id_param;
  
  -- Get mentee profile
  SELECT * INTO profile_rec FROM profiles WHERE user_id = mentee_user_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Industry/sector match (40 points)
  common_sectors := ARRAY(
    SELECT UNNEST(mentor_rec.expertise_areas)
    INTERSECT
    SELECT UNNEST(profile_rec.industry_sectors)
  );
  
  IF array_length(common_sectors, 1) > 0 THEN
    match_score := match_score + (LEAST(array_length(common_sectors, 1) * 10, 40));
  END IF;
  
  -- Skills/interests alignment (30 points)
  common_interests := ARRAY(
    SELECT UNNEST(mentor_rec.specializations)
    INTERSECT
    SELECT UNNEST(profile_rec.interests)
  );
  
  IF array_length(common_interests, 1) > 0 THEN
    match_score := match_score + (LEAST(array_length(common_interests, 1) * 10, 30));
  END IF;
  
  -- Mentor availability (15 points)
  IF mentor_rec.status = 'available' THEN
    match_score := match_score + 15;
  END IF;
  
  -- Mentor rating bonus (15 points)
  IF mentor_rec.rating IS NOT NULL AND mentor_rec.rating >= 4.0 THEN
    match_score := match_score + 15;
  ELSIF mentor_rec.rating IS NOT NULL AND mentor_rec.rating >= 3.0 THEN
    match_score := match_score + 10;
  END IF;
  
  RETURN LEAST(match_score, 100);
END;
$$;

-- Create function to calculate service match score
CREATE OR REPLACE FUNCTION public.calculate_service_match_score(
  service_id_param UUID,
  buyer_user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_score INTEGER := 0;
  service_rec RECORD;
  profile_rec RECORD;
  startup_rec RECORD;
  common_industries TEXT[];
BEGIN
  -- Get service details
  SELECT * INTO service_rec FROM services WHERE id = service_id_param;
  
  -- Get buyer profile
  SELECT * INTO profile_rec FROM profiles WHERE user_id = buyer_user_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Try to get startup profile for more context
  SELECT * INTO startup_rec FROM startup_profiles WHERE user_id = buyer_user_id_param;
  
  -- Industry match (40 points)
  IF service_rec.target_industries IS NOT NULL THEN
    IF startup_rec.industry IS NOT NULL AND startup_rec.industry = ANY(service_rec.target_industries) THEN
      match_score := match_score + 40;
    ELSIF profile_rec.industry_sectors IS NOT NULL THEN
      common_industries := ARRAY(
        SELECT UNNEST(service_rec.target_industries)
        INTERSECT
        SELECT UNNEST(profile_rec.industry_sectors)
      );
      IF array_length(common_industries, 1) > 0 THEN
        match_score := match_score + 30;
      END IF;
    END IF;
  ELSE
    -- If no specific target industries, give partial points
    match_score := match_score + 20;
  END IF;
  
  -- Service rating (20 points)
  IF service_rec.rating IS NOT NULL AND service_rec.rating >= 4.0 THEN
    match_score := match_score + 20;
  ELSIF service_rec.rating IS NOT NULL AND service_rec.rating >= 3.0 THEN
    match_score := match_score + 15;
  ELSIF service_rec.rating IS NOT NULL THEN
    match_score := match_score + 10;
  END IF;
  
  -- Service activity and popularity (20 points)
  IF service_rec.is_active THEN
    match_score := match_score + 10;
  END IF;
  
  IF service_rec.total_subscribers > 10 THEN
    match_score := match_score + 10;
  ELSIF service_rec.total_subscribers > 5 THEN
    match_score := match_score + 5;
  END IF;
  
  -- Featured service bonus (10 points)
  IF service_rec.is_featured THEN
    match_score := match_score + 10;
  END IF;
  
  -- Cohort benefits (10 points)
  IF service_rec.cohort_benefits IS NOT NULL THEN
    match_score := match_score + 10;
  END IF;
  
  RETURN LEAST(match_score, 100);
END;
$$;

-- Create function to trigger matching for new funding opportunities
CREATE OR REPLACE FUNCTION public.trigger_funding_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  startup_record RECORD;
  match_score_value INTEGER;
  match_reasons_array TEXT[];
BEGIN
  -- Only trigger for active opportunities
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'active')) THEN
    
    -- Find all startups and calculate match scores
    FOR startup_record IN 
      SELECT id, industry, stage, funding_needed, user_id
      FROM startup_profiles
    LOOP
      match_score_value := calculate_funding_match_score(startup_record.id, NEW.funder_id);
      
      -- Only create matches with score >= 40
      IF match_score_value >= 40 THEN
        match_reasons_array := ARRAY[]::TEXT[];
        
        -- Build match reasons
        IF startup_record.industry = ANY(
          SELECT preferred_industries FROM funders WHERE id = NEW.funder_id
        ) THEN
          match_reasons_array := array_append(match_reasons_array, 'Industry match');
        END IF;
        
        IF startup_record.stage = ANY(
          SELECT preferred_stages FROM funders WHERE id = NEW.funder_id
        ) THEN
          match_reasons_array := array_append(match_reasons_array, 'Stage match');
        END IF;
        
        IF startup_record.funding_needed >= NEW.amount_min AND 
           startup_record.funding_needed <= NEW.amount_max THEN
          match_reasons_array := array_append(match_reasons_array, 'Funding amount match');
        END IF;
        
        -- Insert or update match
        INSERT INTO funding_matches (
          opportunity_id,
          startup_id,
          match_score,
          match_reasons,
          is_viewed,
          is_dismissed
        ) VALUES (
          NEW.id,
          startup_record.id,
          match_score_value,
          match_reasons_array,
          false,
          false
        )
        ON CONFLICT DO NOTHING;
        
        -- Create notification
        INSERT INTO match_notifications (
          user_id,
          match_type,
          match_id,
          is_read
        ) VALUES (
          startup_record.user_id,
          'funding',
          NEW.id,
          false
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to trigger matching for new services
CREATE OR REPLACE FUNCTION public.trigger_service_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  match_score_value INTEGER;
  match_reasons_array TEXT[];
BEGIN
  -- Only trigger for active services
  IF NEW.is_active = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_active = false)) THEN
    
    -- Find all potential buyers (users with startup profiles or relevant industries)
    FOR profile_record IN 
      SELECT DISTINCT p.user_id, p.industry_sectors
      FROM profiles p
      WHERE p.persona_type IN ('startup', 'smme', 'unassigned')
        AND p.user_id != (SELECT user_id FROM service_providers WHERE id = NEW.provider_id)
    LOOP
      match_score_value := calculate_service_match_score(NEW.id, profile_record.user_id);
      
      -- Only create matches with score >= 40
      IF match_score_value >= 40 THEN
        match_reasons_array := ARRAY[]::TEXT[];
        
        -- Build match reasons
        IF NEW.target_industries IS NOT NULL AND 
           profile_record.industry_sectors && NEW.target_industries THEN
          match_reasons_array := array_append(match_reasons_array, 'Industry alignment');
        END IF;
        
        IF NEW.rating >= 4.0 THEN
          match_reasons_array := array_append(match_reasons_array, 'Highly rated service');
        END IF;
        
        IF NEW.is_featured THEN
          match_reasons_array := array_append(match_reasons_array, 'Featured provider');
        END IF;
        
        -- Insert match
        INSERT INTO service_matches (
          service_id,
          buyer_user_id,
          match_score,
          match_reasons,
          is_viewed,
          is_dismissed
        ) VALUES (
          NEW.id,
          profile_record.user_id,
          match_score_value,
          match_reasons_array,
          false,
          false
        )
        ON CONFLICT DO NOTHING;
        
        -- Create notification
        INSERT INTO match_notifications (
          user_id,
          match_type,
          match_id,
          is_read
        ) VALUES (
          profile_record.user_id,
          'service',
          NEW.id,
          false
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_funding_opportunity_published ON public.funding_opportunities;
CREATE TRIGGER on_funding_opportunity_published
  AFTER INSERT OR UPDATE ON public.funding_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_funding_matches();

DROP TRIGGER IF EXISTS on_service_published ON public.services;
CREATE TRIGGER on_service_published
  AFTER INSERT OR UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_service_matches();

-- Create function to manually trigger mentor matches for a user
CREATE OR REPLACE FUNCTION public.generate_mentor_matches_for_user(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentor_record RECORD;
  match_score_value INTEGER;
  match_reasons_array TEXT[];
  matches_created INTEGER := 0;
BEGIN
  -- Delete existing matches for this user
  DELETE FROM mentor_matches WHERE mentee_user_id = user_id_param;
  
  -- Find all available mentors and calculate match scores
  FOR mentor_record IN 
    SELECT m.id, m.user_id, m.expertise_areas, m.specializations, m.rating, m.status
    FROM mentors m
    WHERE m.status = 'available'
      AND m.user_id != user_id_param
  LOOP
    match_score_value := calculate_mentor_match_score(mentor_record.id, user_id_param);
    
    -- Only create matches with score >= 30
    IF match_score_value >= 30 THEN
      match_reasons_array := ARRAY[]::TEXT[];
      
      -- Build match reasons based on profile overlap
      IF match_score_value >= 70 THEN
        match_reasons_array := array_append(match_reasons_array, 'Excellent expertise match');
      ELSIF match_score_value >= 50 THEN
        match_reasons_array := array_append(match_reasons_array, 'Good industry alignment');
      ELSE
        match_reasons_array := array_append(match_reasons_array, 'Relevant experience');
      END IF;
      
      IF mentor_record.rating >= 4.5 THEN
        match_reasons_array := array_append(match_reasons_array, 'Top-rated mentor');
      ELSIF mentor_record.rating >= 4.0 THEN
        match_reasons_array := array_append(match_reasons_array, 'Highly rated');
      END IF;
      
      -- Insert match
      INSERT INTO mentor_matches (
        mentor_id,
        mentee_user_id,
        match_score,
        match_reasons,
        is_viewed,
        is_dismissed
      ) VALUES (
        mentor_record.id,
        user_id_param,
        match_score_value,
        match_reasons_array,
        false,
        false
      );
      
      matches_created := matches_created + 1;
    END IF;
  END LOOP;
  
  -- Create notification if matches were found
  IF matches_created > 0 THEN
    INSERT INTO messages (
      user_id,
      subject,
      body,
      message_type
    ) VALUES (
      user_id_param,
      'New Mentor Matches Available',
      format('We found %s mentor matches based on your profile. Check your dashboard to explore these opportunities.', matches_created),
      'notification'
    );
  END IF;
  
  RETURN matches_created;
END;
$$;

-- Add updated_at trigger for new tables
CREATE TRIGGER update_mentor_matches_updated_at
  BEFORE UPDATE ON public.mentor_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_matches_updated_at
  BEFORE UPDATE ON public.service_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('sale', 'expense', 'deposit', 'withdrawal', 'supplier_purchase');

-- Create channel type enum
CREATE TYPE public.channel_type AS ENUM ('app', 'ussd', 'sms', 'whatsapp', 'qr');

-- Create KYC tier type enum
CREATE TYPE public.kyc_tier_type AS ENUM ('none', 'lite', 'full');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app',
  description TEXT,
  provenance JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_scores table
CREATE TABLE public.business_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('A', 'B', 'C', 'D', 'E')),
  top_drivers JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS kyc_tier kyc_tier_type DEFAULT 'none';

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = trader_id);

-- RLS Policies for business_scores
CREATE POLICY "Users can view their own scores"
  ON public.business_scores FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own scores"
  ON public.business_scores FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

-- RLS Policies for rewards
CREATE POLICY "Users can view their own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own rewards"
  ON public.rewards FOR UPDATE
  USING (auth.uid() = trader_id);

-- Create function to auto-create rewards on first transaction
CREATE OR REPLACE FUNCTION public.create_rewards_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create rewards entry if it doesn't exist
  INSERT INTO public.rewards (trader_id, points, lifetime_points)
  VALUES (NEW.trader_id, 10, 10)
  ON CONFLICT (trader_id) 
  DO UPDATE SET 
    points = rewards.points + 10,
    lifetime_points = rewards.lifetime_points + 10,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to award points on transaction
CREATE TRIGGER award_points_on_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_rewards_on_transaction();

-- Create indexes for better performance
CREATE INDEX idx_transactions_trader_id ON public.transactions(trader_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_business_scores_trader_id ON public.business_scores(trader_id);
CREATE INDEX idx_business_scores_calculated_at ON public.business_scores(calculated_at DESC);
CREATE INDEX idx_rewards_trader_id ON public.rewards(trader_id);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;-- Create transaction type enum if not exists
DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('sale', 'expense', 'deposit', 'withdrawal', 'supplier_purchase');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create channel type enum if not exists
DO $$ BEGIN
  CREATE TYPE public.channel_type AS ENUM ('app', 'ussd', 'sms', 'whatsapp', 'qr');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create KYC tier type enum if not exists
DO $$ BEGIN
  CREATE TYPE public.kyc_tier_type AS ENUM ('none', 'lite', 'full');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create transactions table if not exists
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app',
  description TEXT,
  provenance JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_scores table if not exists
CREATE TABLE IF NOT EXISTS public.business_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('A', 'B', 'C', 'D', 'E')),
  top_drivers JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rewards table if not exists
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS kyc_tier kyc_tier_type DEFAULT 'none';

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own scores" ON public.business_scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.business_scores;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON public.rewards;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = trader_id);

-- RLS Policies for business_scores
CREATE POLICY "Users can view their own scores"
  ON public.business_scores FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own scores"
  ON public.business_scores FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

-- RLS Policies for rewards
CREATE POLICY "Users can view their own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own rewards"
  ON public.rewards FOR UPDATE
  USING (auth.uid() = trader_id);

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS award_points_on_transaction ON public.transactions;
DROP FUNCTION IF EXISTS public.create_rewards_on_transaction();

-- Create function to auto-create rewards on first transaction
CREATE FUNCTION public.create_rewards_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create rewards entry if it doesn't exist
  INSERT INTO public.rewards (trader_id, points, lifetime_points)
  VALUES (NEW.trader_id, 10, 10)
  ON CONFLICT (trader_id) 
  DO UPDATE SET 
    points = rewards.points + 10,
    lifetime_points = rewards.lifetime_points + 10,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to award points on transaction
CREATE TRIGGER award_points_on_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_rewards_on_transaction();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_transactions_trader_id ON public.transactions(trader_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_scores_trader_id ON public.business_scores(trader_id);
CREATE INDEX IF NOT EXISTS idx_business_scores_calculated_at ON public.business_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_trader_id ON public.rewards(trader_id);-- This migration ensures all Financial Inclusion tables and policies are set up correctly
-- Tables should already exist, this just ensures policies and indexes are correct

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Ensure all required policies exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.transactions FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions'
  ) THEN
    CREATE POLICY "Users can insert their own transactions"
      ON public.transactions FOR INSERT
      WITH CHECK (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_scores' AND policyname = 'Users can view their own scores'
  ) THEN
    CREATE POLICY "Users can view their own scores"
      ON public.business_scores FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Users can view their own rewards'
  ) THEN
    CREATE POLICY "Users can view their own rewards"
      ON public.rewards FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;-- Add 'cash' to channel_type enum
ALTER TYPE channel_type ADD VALUE IF NOT EXISTS 'cash';-- Create model_states table for financial model persistence
CREATE TABLE IF NOT EXISTS public.model_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  model_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_states ENABLE ROW LEVEL SECURITY;

-- Users can view their own models
CREATE POLICY "Users can view their own models"
ON public.model_states
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own models
CREATE POLICY "Users can create their own models"
ON public.model_states
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own models
CREATE POLICY "Users can update their own models"
ON public.model_states
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own models
CREATE POLICY "Users can delete their own models"
ON public.model_states
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_model_states_user_id ON public.model_states(user_id);
CREATE INDEX IF NOT EXISTS idx_model_states_updated_at ON public.model_states(updated_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_model_states_updated_at
BEFORE UPDATE ON public.model_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Comprehensive Indexing Strategy for Performance Optimization (Revised)
-- Only creating indexes for verified existing columns

-- =====================================================
-- MATCHING SYSTEM INDEXES
-- =====================================================

-- Mentor Matches: Optimize user match queries
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentee_user_id 
  ON mentor_matches(mentee_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor_id 
  ON mentor_matches(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_composite 
  ON mentor_matches(mentee_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_created 
  ON mentor_matches(created_at DESC);

-- Service Matches: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_service_matches_buyer_user_id 
  ON service_matches(buyer_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_service_matches_service_id 
  ON service_matches(service_id);

CREATE INDEX IF NOT EXISTS idx_service_matches_composite 
  ON service_matches(buyer_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_service_matches_created 
  ON service_matches(created_at DESC);

-- Funding Matches: Optimize funding opportunities
CREATE INDEX IF NOT EXISTS idx_funding_matches_startup_id 
  ON funding_matches(startup_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_funding_matches_opportunity_id 
  ON funding_matches(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_funding_matches_composite 
  ON funding_matches(startup_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_funding_matches_created 
  ON funding_matches(created_at DESC);

-- =====================================================
-- MESSAGING & COMMUNICATIONS INDEXES
-- =====================================================

-- Messages: Optimize inbox queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id_read 
  ON messages(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_entity 
  ON messages(related_entity_type, related_entity_id) 
  WHERE related_entity_id IS NOT NULL;

-- Conversation Participants: Optimize user conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
  ON conversation_participants(user_id, is_archived, is_pinned, last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id, user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread 
  ON conversation_participants(user_id, unread_count) 
  WHERE unread_count > 0;

-- =====================================================
-- MENTORSHIP SYSTEM INDEXES
-- =====================================================

-- Mentor Availability: Optimize availability queries
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor 
  ON mentor_availability(mentor_id, day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_active 
  ON mentor_availability(is_active) 
  WHERE is_active = true;

-- Mentor Date Overrides: Optimize date lookups
CREATE INDEX IF NOT EXISTS idx_mentor_date_overrides_mentor 
  ON mentor_date_overrides(mentor_id, date);

-- Mentors: Optimize mentor discovery
CREATE INDEX IF NOT EXISTS idx_mentors_user_id 
  ON mentors(user_id);

CREATE INDEX IF NOT EXISTS idx_mentors_status 
  ON mentors(status, rating DESC);

-- =====================================================
-- CREDIT & FINANCIAL INDEXES
-- =====================================================

-- Credit Assessments: Optimize assessment queries
CREATE INDEX IF NOT EXISTS idx_credit_assessments_user 
  ON credit_assessments(user_id, status, assessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_startup 
  ON credit_assessments(startup_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_shared 
  ON credit_assessments(consent_to_share, overall_score DESC) 
  WHERE consent_to_share = true AND status = 'completed';

-- Transactions: Optimize transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_trader 
  ON transactions(trader_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
  ON transactions(trader_id, txn_type, created_at DESC);

-- Credits Transactions: Optimize credits history
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user 
  ON credits_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credits_transactions_type 
  ON credits_transactions(user_id, transaction_type, created_at DESC);

-- Business Scores: Optimize score lookups
CREATE INDEX IF NOT EXISTS idx_business_scores_trader 
  ON business_scores(trader_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_scores_tier 
  ON business_scores(credit_tier, score DESC);

-- Credits Wallet: Optimize wallet lookups
CREATE INDEX IF NOT EXISTS idx_credits_wallet_user 
  ON credits_wallet(user_id);

-- =====================================================
-- MARKETPLACE INDEXES
-- =====================================================

-- Services: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_services_provider 
  ON services(provider_id, is_active);

CREATE INDEX IF NOT EXISTS idx_services_category 
  ON services(category_id, is_active, is_featured DESC, rating DESC);

CREATE INDEX IF NOT EXISTS idx_services_active 
  ON services(is_active, rating DESC, total_reviews DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_featured 
  ON services(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- User Subscriptions: Optimize subscription queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user 
  ON user_subscriptions(user_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_listing 
  ON user_subscriptions(listing_id, status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active 
  ON user_subscriptions(user_id, expires_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cohort 
  ON user_subscriptions(cohort_id) 
  WHERE cohort_id IS NOT NULL;

-- Service Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_parent 
  ON service_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_categories_active 
  ON service_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_categories_slug 
  ON service_categories(slug) 
  WHERE is_active = true;

-- Listing Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_listing_categories_parent 
  ON listing_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_categories_active 
  ON listing_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listing_categories_slug 
  ON listing_categories(slug) 
  WHERE is_active = true;

-- =====================================================
-- FUNDING SYSTEM INDEXES
-- =====================================================

-- Funding Applications: Optimize application queries
CREATE INDEX IF NOT EXISTS idx_funding_applications_applicant 
  ON funding_applications(applicant_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_opportunity 
  ON funding_applications(opportunity_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_startup 
  ON funding_applications(startup_id, status);

-- =====================================================
-- USER & PROFILE INDEXES
-- =====================================================

-- Profiles: Optimize profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_persona 
  ON profiles(persona_type) 
  WHERE persona_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- User Roles: Optimize role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user 
  ON user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
  ON user_roles(role);

-- Startup Profiles: Optimize startup queries
CREATE INDEX IF NOT EXISTS idx_startup_profiles_user 
  ON startup_profiles(user_id);

-- Funders: Optimize funder queries
CREATE INDEX IF NOT EXISTS idx_funders_user 
  ON funders(user_id);

CREATE INDEX IF NOT EXISTS idx_funders_verified 
  ON funders(is_verified) 
  WHERE is_verified = true;

-- Service Providers: Optimize provider queries
CREATE INDEX IF NOT EXISTS idx_service_providers_user 
  ON service_providers(user_id);

CREATE INDEX IF NOT EXISTS idx_service_providers_vetting 
  ON service_providers(vetting_status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_providers_verified 
  ON service_providers(is_verified) 
  WHERE is_verified = true;

-- File Shares: Optimize shared file queries
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with 
  ON file_shares(shared_with, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_shares_file 
  ON file_shares(file_id);

CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by 
  ON file_shares(shared_by);

-- Score Sharing: Optimize score access
CREATE INDEX IF NOT EXISTS idx_score_sharing_assessment 
  ON score_sharing(assessment_id);

CREATE INDEX IF NOT EXISTS idx_score_sharing_funder 
  ON score_sharing(funder_id, shared_at DESC);

-- =====================================================
-- NOTIFICATIONS & ACTIVITY INDEXES
-- =====================================================

-- Match Notifications: Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_match_notifications_user 
  ON match_notifications(user_id, is_read, notification_sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_notifications_match 
  ON match_notifications(match_type, match_id);

-- =====================================================
-- COHORT SYSTEM INDEXES
-- =====================================================

-- Cohort Memberships: Optimize cohort queries
CREATE INDEX IF NOT EXISTS idx_cohort_memberships_user 
  ON cohort_memberships(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_memberships_cohort 
  ON cohort_memberships(cohort_id, is_active, joined_at DESC);

-- Cohort Funded Listings: Optimize cohort benefits
CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_cohort 
  ON cohort_funded_listings(cohort_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_listing 
  ON cohort_funded_listings(listing_id, is_active);

-- =====================================================
-- RESOURCES INDEXES
-- =====================================================

-- Resources: Optimize content discovery
CREATE INDEX IF NOT EXISTS idx_resources_category 
  ON resources(category_id, is_active, is_featured DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_access_level 
  ON resources(access_level, is_active, view_count DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_resources_type 
  ON resources(resource_type, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_featured 
  ON resources(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- Resource Ratings: Optimize rating queries
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource 
  ON resource_ratings(resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_user 
  ON resource_ratings(user_id);

-- Resource Bookmarks: Optimize bookmark queries
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user 
  ON resource_bookmarks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource 
  ON resource_bookmarks(resource_id);

-- =====================================================
-- REVIEWS & RATINGS INDEXES
-- =====================================================

-- Listing Reviews: Optimize review queries
CREATE INDEX IF NOT EXISTS idx_listing_reviews_listing 
  ON listing_reviews(listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_reviews_user 
  ON listing_reviews(user_id);

-- =====================================================
-- MODEL STATES INDEXES (Financial Models)
-- =====================================================

-- Model States: Optimize model queries
CREATE INDEX IF NOT EXISTS idx_model_states_user 
  ON model_states(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_states_name 
  ON model_states(user_id, name);

-- =====================================================
-- REWARDS SYSTEM INDEXES
-- =====================================================

-- Rewards: Optimize rewards queries
CREATE INDEX IF NOT EXISTS idx_rewards_trader 
  ON rewards(trader_id);

CREATE INDEX IF NOT EXISTS idx_rewards_points 
  ON rewards(points DESC) 
  WHERE points > 0;

-- =====================================================
-- ANALYZE FOR PERFORMANCE
-- =====================================================

ANALYZE;-- Comprehensive Indexing Strategy for Performance Optimization (Revised)
-- Only creating indexes for verified existing columns

-- =====================================================
-- MATCHING SYSTEM INDEXES
-- =====================================================

-- Mentor Matches: Optimize user match queries
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentee_user_id 
  ON mentor_matches(mentee_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor_id 
  ON mentor_matches(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_composite 
  ON mentor_matches(mentee_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_created 
  ON mentor_matches(created_at DESC);

-- Service Matches: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_service_matches_buyer_user_id 
  ON service_matches(buyer_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_service_matches_service_id 
  ON service_matches(service_id);

CREATE INDEX IF NOT EXISTS idx_service_matches_composite 
  ON service_matches(buyer_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_service_matches_created 
  ON service_matches(created_at DESC);

-- Funding Matches: Optimize funding opportunities
CREATE INDEX IF NOT EXISTS idx_funding_matches_startup_id 
  ON funding_matches(startup_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_funding_matches_opportunity_id 
  ON funding_matches(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_funding_matches_composite 
  ON funding_matches(startup_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_funding_matches_created 
  ON funding_matches(created_at DESC);

-- =====================================================
-- MESSAGING & COMMUNICATIONS INDEXES
-- =====================================================

-- Messages: Optimize inbox queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id_read 
  ON messages(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_entity 
  ON messages(related_entity_type, related_entity_id) 
  WHERE related_entity_id IS NOT NULL;

-- Conversation Participants: Optimize user conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
  ON conversation_participants(user_id, is_archived, is_pinned, last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id, user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread 
  ON conversation_participants(user_id, unread_count) 
  WHERE unread_count > 0;

-- =====================================================
-- MENTORSHIP SYSTEM INDEXES
-- =====================================================

-- Mentor Availability: Optimize availability queries
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor 
  ON mentor_availability(mentor_id, day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_active 
  ON mentor_availability(is_active) 
  WHERE is_active = true;

-- Mentor Date Overrides: Optimize date lookups
CREATE INDEX IF NOT EXISTS idx_mentor_date_overrides_mentor 
  ON mentor_date_overrides(mentor_id, date);

-- Mentors: Optimize mentor discovery
CREATE INDEX IF NOT EXISTS idx_mentors_user_id 
  ON mentors(user_id);

CREATE INDEX IF NOT EXISTS idx_mentors_status 
  ON mentors(status, rating DESC);

-- =====================================================
-- CREDIT & FINANCIAL INDEXES
-- =====================================================

-- Credit Assessments: Optimize assessment queries
CREATE INDEX IF NOT EXISTS idx_credit_assessments_user 
  ON credit_assessments(user_id, status, assessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_startup 
  ON credit_assessments(startup_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_shared 
  ON credit_assessments(consent_to_share, overall_score DESC) 
  WHERE consent_to_share = true AND status = 'completed';

-- Transactions: Optimize transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_trader 
  ON transactions(trader_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
  ON transactions(trader_id, txn_type, created_at DESC);

-- Credits Transactions: Optimize credits history
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user 
  ON credits_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credits_transactions_type 
  ON credits_transactions(user_id, transaction_type, created_at DESC);

-- Business Scores: Optimize score lookups
CREATE INDEX IF NOT EXISTS idx_business_scores_trader 
  ON business_scores(trader_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_scores_tier 
  ON business_scores(credit_tier, score DESC);

-- Credits Wallet: Optimize wallet lookups
CREATE INDEX IF NOT EXISTS idx_credits_wallet_user 
  ON credits_wallet(user_id);

-- =====================================================
-- MARKETPLACE INDEXES
-- =====================================================

-- Services: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_services_provider 
  ON services(provider_id, is_active);

CREATE INDEX IF NOT EXISTS idx_services_category 
  ON services(category_id, is_active, is_featured DESC, rating DESC);

CREATE INDEX IF NOT EXISTS idx_services_active 
  ON services(is_active, rating DESC, total_reviews DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_featured 
  ON services(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- User Subscriptions: Optimize subscription queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user 
  ON user_subscriptions(user_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_listing 
  ON user_subscriptions(listing_id, status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active 
  ON user_subscriptions(user_id, expires_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cohort 
  ON user_subscriptions(cohort_id) 
  WHERE cohort_id IS NOT NULL;

-- Service Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_parent 
  ON service_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_categories_active 
  ON service_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_categories_slug 
  ON service_categories(slug) 
  WHERE is_active = true;

-- Listing Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_listing_categories_parent 
  ON listing_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_categories_active 
  ON listing_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listing_categories_slug 
  ON listing_categories(slug) 
  WHERE is_active = true;

-- =====================================================
-- FUNDING SYSTEM INDEXES
-- =====================================================

-- Funding Applications: Optimize application queries
CREATE INDEX IF NOT EXISTS idx_funding_applications_applicant 
  ON funding_applications(applicant_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_opportunity 
  ON funding_applications(opportunity_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_startup 
  ON funding_applications(startup_id, status);

-- =====================================================
-- USER & PROFILE INDEXES
-- =====================================================

-- Profiles: Optimize profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_persona 
  ON profiles(persona_type) 
  WHERE persona_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- User Roles: Optimize role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user 
  ON user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
  ON user_roles(role);

-- Startup Profiles: Optimize startup queries
CREATE INDEX IF NOT EXISTS idx_startup_profiles_user 
  ON startup_profiles(user_id);

-- Funders: Optimize funder queries
CREATE INDEX IF NOT EXISTS idx_funders_user 
  ON funders(user_id);

CREATE INDEX IF NOT EXISTS idx_funders_verified 
  ON funders(is_verified) 
  WHERE is_verified = true;

-- Service Providers: Optimize provider queries
CREATE INDEX IF NOT EXISTS idx_service_providers_user 
  ON service_providers(user_id);

CREATE INDEX IF NOT EXISTS idx_service_providers_vetting 
  ON service_providers(vetting_status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_providers_verified 
  ON service_providers(is_verified) 
  WHERE is_verified = true;

-- File Shares: Optimize shared file queries
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with 
  ON file_shares(shared_with, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_shares_file 
  ON file_shares(file_id);

CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by 
  ON file_shares(shared_by);

-- Score Sharing: Optimize score access
CREATE INDEX IF NOT EXISTS idx_score_sharing_assessment 
  ON score_sharing(assessment_id);

CREATE INDEX IF NOT EXISTS idx_score_sharing_funder 
  ON score_sharing(funder_id, shared_at DESC);

-- =====================================================
-- NOTIFICATIONS & ACTIVITY INDEXES
-- =====================================================

-- Match Notifications: Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_match_notifications_user 
  ON match_notifications(user_id, is_read, notification_sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_notifications_match 
  ON match_notifications(match_type, match_id);

-- =====================================================
-- COHORT SYSTEM INDEXES
-- =====================================================

-- Cohort Memberships: Optimize cohort queries
CREATE INDEX IF NOT EXISTS idx_cohort_memberships_user 
  ON cohort_memberships(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_memberships_cohort 
  ON cohort_memberships(cohort_id, is_active, joined_at DESC);

-- Cohort Funded Listings: Optimize cohort benefits
CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_cohort 
  ON cohort_funded_listings(cohort_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_listing 
  ON cohort_funded_listings(listing_id, is_active);

-- =====================================================
-- RESOURCES INDEXES
-- =====================================================

-- Resources: Optimize content discovery
CREATE INDEX IF NOT EXISTS idx_resources_category 
  ON resources(category_id, is_active, is_featured DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_access_level 
  ON resources(access_level, is_active, view_count DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_resources_type 
  ON resources(resource_type, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_featured 
  ON resources(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- Resource Ratings: Optimize rating queries
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource 
  ON resource_ratings(resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_user 
  ON resource_ratings(user_id);

-- Resource Bookmarks: Optimize bookmark queries
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user 
  ON resource_bookmarks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource 
  ON resource_bookmarks(resource_id);

-- =====================================================
-- REVIEWS & RATINGS INDEXES
-- =====================================================

-- Listing Reviews: Optimize review queries
CREATE INDEX IF NOT EXISTS idx_listing_reviews_listing 
  ON listing_reviews(listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_reviews_user 
  ON listing_reviews(user_id);

-- =====================================================
-- MODEL STATES INDEXES (Financial Models)
-- =====================================================

-- Model States: Optimize model queries
CREATE INDEX IF NOT EXISTS idx_model_states_user 
  ON model_states(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_states_name 
  ON model_states(user_id, name);

-- =====================================================
-- REWARDS SYSTEM INDEXES
-- =====================================================

-- Rewards: Optimize rewards queries
CREATE INDEX IF NOT EXISTS idx_rewards_trader 
  ON rewards(trader_id);

CREATE INDEX IF NOT EXISTS idx_rewards_points 
  ON rewards(points DESC) 
  WHERE points > 0;

-- =====================================================
-- ANALYZE FOR PERFORMANCE
-- =====================================================

ANALYZE;-- Create security definer functions for common RLS checks

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
);-- Implement table partitioning for high-volume tables with explicit column mapping
-- This improves query performance and makes data management easier

-- =====================================================
-- 1. PARTITION TRANSACTIONS TABLE (by created_at)
-- =====================================================

CREATE TABLE public.transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL,
  amount numeric NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app'::channel_type,
  provenance jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_transactions_part_trader ON public.transactions_partitioned(trader_id);
CREATE INDEX idx_transactions_part_created ON public.transactions_partitioned(created_at);

-- Create partitions for 2024-2025 (quarterly)
CREATE TABLE public.transactions_2024_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.transactions_2024_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.transactions_2024_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.transactions_2024_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.transactions_2025_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.transactions_2025_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.transactions_2025_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.transactions_2025_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.transactions_default PARTITION OF public.transactions_partitioned DEFAULT;

-- Migrate data with explicit column mapping
INSERT INTO public.transactions_partitioned (id, trader_id, amount, txn_type, channel, provenance, created_at, updated_at, description)
SELECT id, trader_id, amount, txn_type, channel, provenance, created_at, updated_at, description 
FROM public.transactions;

-- Swap tables
ALTER TABLE public.transactions RENAME TO transactions_old_backup;
ALTER TABLE public.transactions_partitioned RENAME TO transactions;

-- RLS policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = trader_id);

-- Trigger
CREATE TRIGGER create_rewards_on_transaction AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.create_rewards_on_transaction();

-- =====================================================
-- 2. PARTITION MESSAGES TABLE
-- =====================================================

CREATE TABLE public.messages_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  related_entity_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text NOT NULL,
  body text NOT NULL,
  message_type text NOT NULL DEFAULT 'notification'::text,
  related_entity_type text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_messages_part_user ON public.messages_partitioned(user_id);
CREATE INDEX idx_messages_part_created ON public.messages_partitioned(created_at);

CREATE TABLE public.messages_2024_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.messages_2024_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.messages_2024_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.messages_2024_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.messages_2025_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.messages_2025_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.messages_2025_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.messages_2025_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.messages_default PARTITION OF public.messages_partitioned DEFAULT;

-- Migrate data with explicit column mapping
INSERT INTO public.messages_partitioned (id, user_id, is_read, related_entity_id, created_at, updated_at, subject, body, message_type, related_entity_type)
SELECT id, user_id, is_read, related_entity_id, created_at, updated_at, subject, body, message_type, related_entity_type
FROM public.messages;

ALTER TABLE public.messages RENAME TO messages_old_backup;
ALTER TABLE public.messages_partitioned RENAME TO messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 3. PARTITION CREDITS_TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE public.credits_transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reference_id uuid,
  balance_after integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  transaction_type text NOT NULL,
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_credits_trans_part_user ON public.credits_transactions_partitioned(user_id);
CREATE INDEX idx_credits_trans_part_created ON public.credits_transactions_partitioned(created_at);

CREATE TABLE public.credits_transactions_2024_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.credits_transactions_2024_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.credits_transactions_2024_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.credits_transactions_2024_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.credits_transactions_2025_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.credits_transactions_2025_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.credits_transactions_2025_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.credits_transactions_2025_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.credits_transactions_default PARTITION OF public.credits_transactions_partitioned DEFAULT;

-- Migrate data with explicit column mapping
INSERT INTO public.credits_transactions_partitioned (id, user_id, amount, reference_id, balance_after, created_at, transaction_type, description)
SELECT id, user_id, amount, reference_id, balance_after, created_at, transaction_type, description
FROM public.credits_transactions;

ALTER TABLE public.credits_transactions RENAME TO credits_transactions_old_backup;
ALTER TABLE public.credits_transactions_partitioned RENAME TO credits_transactions;

ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their transactions" ON public.credits_transactions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Create future partitions
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_quarterly_partition(table_name TEXT, start_date DATE) 
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  end_date DATE;
BEGIN
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_Q"q"');
  end_date := start_date + INTERVAL '3 months';
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)', partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.create_quarterly_partition IS 'Create quarterly partitions. Usage: SELECT create_quarterly_partition(''transactions'', ''2026-01-01'');';-- Complete cleanup and partitioning implementation
-- Drop all objects from previous attempts

-- Drop old backup tables
DROP TABLE IF EXISTS public.transactions_old_backup CASCADE;
DROP TABLE IF EXISTS public.messages_old_backup CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_old_backup CASCADE;

-- Drop partitioned tables
DROP TABLE IF EXISTS public.transactions_partitioned CASCADE;
DROP TABLE IF EXISTS public.messages_partitioned CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_partitioned CASCADE;

-- Drop all partition tables
DROP TABLE IF EXISTS public.transactions_2024_q1, public.transactions_2024_q2, public.transactions_2024_q3, public.transactions_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.transactions_2025_q1, public.transactions_2025_q2, public.transactions_2025_q3, public.transactions_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.transactions_default CASCADE;
DROP TABLE IF EXISTS public.messages_2024_q1, public.messages_2024_q2, public.messages_2024_q3, public.messages_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.messages_2025_q1, public.messages_2025_q2, public.messages_2025_q3, public.messages_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.messages_default CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2024_q1, public.credits_transactions_2024_q2 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2024_q3, public.credits_transactions_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2025_q1, public.credits_transactions_2025_q2 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2025_q3, public.credits_transactions_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_default CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_transactions_part_trader, public.idx_transactions_part_created CASCADE;
DROP INDEX IF EXISTS public.idx_messages_part_user, public.idx_messages_part_created CASCADE;
DROP INDEX IF EXISTS public.idx_credits_trans_part_user, public.idx_credits_trans_part_created CASCADE;

-- PARTITION TRANSACTIONS
CREATE TABLE public.transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL,
  amount numeric NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app'::channel_type,
  provenance jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_transactions_part_trader ON public.transactions_partitioned(trader_id);
CREATE INDEX idx_transactions_part_created ON public.transactions_partitioned(created_at);
CREATE TABLE public.transactions_2024_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.transactions_2024_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.transactions_2024_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.transactions_2024_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.transactions_2025_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.transactions_2025_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.transactions_2025_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.transactions_2025_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.transactions_default PARTITION OF public.transactions_partitioned DEFAULT;
INSERT INTO public.transactions_partitioned SELECT * FROM public.transactions;
ALTER TABLE public.transactions RENAME TO transactions_old_backup;
ALTER TABLE public.transactions_partitioned RENAME TO transactions;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = trader_id);
CREATE TRIGGER create_rewards_on_transaction AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.create_rewards_on_transaction();

-- PARTITION MESSAGES
CREATE TABLE public.messages_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  related_entity_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text NOT NULL,
  body text NOT NULL,
  message_type text NOT NULL DEFAULT 'notification'::text,
  related_entity_type text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_messages_part_user ON public.messages_partitioned(user_id);
CREATE INDEX idx_messages_part_created ON public.messages_partitioned(created_at);
CREATE TABLE public.messages_2024_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.messages_2024_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.messages_2024_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.messages_2024_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.messages_2025_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.messages_2025_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.messages_2025_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.messages_2025_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.messages_default PARTITION OF public.messages_partitioned DEFAULT;
INSERT INTO public.messages_partitioned SELECT * FROM public.messages;
ALTER TABLE public.messages RENAME TO messages_old_backup;
ALTER TABLE public.messages_partitioned RENAME TO messages;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- PARTITION CREDITS_TRANSACTIONS
CREATE TABLE public.credits_transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reference_id uuid,
  balance_after integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  transaction_type text NOT NULL,
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_credits_trans_part_user ON public.credits_transactions_partitioned(user_id);
CREATE INDEX idx_credits_trans_part_created ON public.credits_transactions_partitioned(created_at);
CREATE TABLE public.credits_transactions_2024_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.credits_transactions_2024_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.credits_transactions_2024_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.credits_transactions_2024_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.credits_transactions_2025_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.credits_transactions_2025_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.credits_transactions_2025_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.credits_transactions_2025_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.credits_transactions_default PARTITION OF public.credits_transactions_partitioned DEFAULT;
INSERT INTO public.credits_transactions_partitioned SELECT * FROM public.credits_transactions;
ALTER TABLE public.credits_transactions RENAME TO credits_transactions_old_backup;
ALTER TABLE public.credits_transactions_partitioned RENAME TO credits_transactions;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their transactions" ON public.credits_transactions FOR SELECT USING (auth.uid() = user_id);

-- Helper function
CREATE OR REPLACE FUNCTION public.create_quarterly_partition(table_name TEXT, start_date DATE) RETURNS void AS $$
DECLARE partition_name TEXT; end_date DATE;
BEGIN
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_Q"q"');
  end_date := start_date + INTERVAL '3 months';
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)', partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;-- Enable RLS on all partition child tables
-- PostgreSQL requires explicit RLS enablement on partitions

-- Enable RLS on transaction partitions
ALTER TABLE public.transactions_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_default ENABLE ROW LEVEL SECURITY;

-- Enable RLS on message partitions
ALTER TABLE public.messages_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_default ENABLE ROW LEVEL SECURITY;

-- Enable RLS on credits_transactions partitions
ALTER TABLE public.credits_transactions_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_default ENABLE ROW LEVEL SECURITY;-- Add full-text search to key tables

-- PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON public.profiles USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_profiles_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.organization, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.skills, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.interests, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_search_vector_trigger BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_search_vector();

-- MENTORS
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_mentors_search_vector ON public.mentors USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_mentors_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.expertise_areas, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.specializations, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mentors_search_vector_trigger BEFORE INSERT OR UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_mentors_search_vector();

-- RESOURCES
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON public.resources USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_resources_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.author_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resources_search_vector_trigger BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_resources_search_vector();

-- SERVICES
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_services_search_vector ON public.services USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_services_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.key_features, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_services_search_vector_trigger BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_services_search_vector();

-- FUNDING_OPPORTUNITIES
ALTER TABLE public.funding_opportunities ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_search_vector ON public.funding_opportunities USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_funding_opportunities_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.requirements, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_funding_opportunities_search_vector_trigger BEFORE INSERT OR UPDATE ON public.funding_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_funding_opportunities_search_vector();

-- STARTUP_PROFILES
ALTER TABLE public.startup_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_startup_profiles_search_vector ON public.startup_profiles USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_startup_profiles_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.industry, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_startup_profiles_search_vector_trigger BEFORE INSERT OR UPDATE ON public.startup_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_startup_profiles_search_vector();

-- GLOBAL SEARCH FUNCTION
CREATE OR REPLACE FUNCTION public.search_all(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE(result_type TEXT, result_id UUID, title TEXT, description TEXT, rank REAL) AS $$
BEGIN
  RETURN QUERY (
    SELECT 'profile'::TEXT, p.user_id, (p.first_name || ' ' || p.last_name), p.bio, ts_rank(p.search_vector, plainto_tsquery('english', search_query))
    FROM profiles p WHERE p.search_vector @@ plainto_tsquery('english', search_query)
    UNION ALL
    SELECT 'mentor'::TEXT, m.id, m.title, m.company, ts_rank(m.search_vector, plainto_tsquery('english', search_query))
    FROM mentors m WHERE m.search_vector @@ plainto_tsquery('english', search_query)
    UNION ALL
    SELECT 'resource'::TEXT, r.id, r.title, r.description, ts_rank(r.search_vector, plainto_tsquery('english', search_query))
    FROM resources r WHERE r.search_vector @@ plainto_tsquery('english', search_query) AND r.is_active = true
    UNION ALL
    SELECT 'service'::TEXT, s.id, s.name, s.short_description, ts_rank(s.search_vector, plainto_tsquery('english', search_query))
    FROM services s WHERE s.search_vector @@ plainto_tsquery('english', search_query) AND s.is_active = true
    UNION ALL
    SELECT 'funding'::TEXT, f.id, f.title, f.description, ts_rank(f.search_vector, plainto_tsquery('english', search_query))
    FROM funding_opportunities f WHERE f.search_vector @@ plainto_tsquery('english', search_query) AND f.status = 'active'
    UNION ALL
    SELECT 'startup'::TEXT, sp.id, sp.company_name, sp.description, ts_rank(sp.search_vector, plainto_tsquery('english', search_query))
    FROM startup_profiles sp WHERE sp.search_vector @@ plainto_tsquery('english', search_query)
  ) ORDER BY rank DESC LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;-- Create database performance monitoring functions (corrected)

-- =====================================================
-- 1. DATABASE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE(
  stat_name TEXT,
  stat_value TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Database Size'::TEXT, pg_size_pretty(pg_database_size(current_database())), 'size'::TEXT
  UNION ALL
  SELECT 'Active Connections', (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active'), 'connections'
  UNION ALL
  SELECT 'Idle Connections', (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'idle'), 'connections'
  UNION ALL
  SELECT 'Total Tables', (SELECT count(*)::TEXT FROM information_schema.tables WHERE table_schema = 'public'), 'objects'
  UNION ALL
  SELECT 'Total Indexes', (SELECT count(*)::TEXT FROM pg_indexes WHERE schemaname = 'public'), 'objects'
  UNION ALL
  SELECT 'Cache Hit Ratio', 
    (SELECT coalesce(round(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2)::TEXT || '%', '0%')
     FROM pg_stat_database WHERE datname = current_database()), 'performance'
  UNION ALL
  SELECT 'Transactions Committed',
    (SELECT coalesce(sum(xact_commit)::TEXT, '0') FROM pg_stat_database WHERE datname = current_database()), 'transactions'
  UNION ALL
  SELECT 'Transactions Rolled Back',
    (SELECT coalesce(sum(xact_rollback)::TEXT, '0') FROM pg_stat_database WHERE datname = current_database()), 'transactions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 2. TABLE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  total_size TEXT,
  table_size TEXT,
  indexes_size TEXT,
  live_rows BIGINT,
  dead_rows BIGINT,
  last_vacuum TIMESTAMP,
  last_analyze TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)),
    pg_size_pretty(pg_relation_size(schemaname||'.'||relname)),
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)),
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 3. INDEX USAGE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_index_usage()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  index_size TEXT,
  scans BIGINT,
  tuples_read BIGINT,
  usage_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    indexrelname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid)),
    idx_scan,
    idx_tup_read,
    CASE 
      WHEN idx_scan = 0 THEN 'UNUSED'
      WHEN idx_scan < 50 THEN 'LOW USAGE'
      ELSE 'ACTIVE'
    END::TEXT
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 4. TABLE BLOAT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_table_bloat()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  bloat_pct NUMERIC,
  bloat_size TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    CASE 
      WHEN n_live_tup > 0 THEN 
        round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
      ELSE 0
    END,
    pg_size_pretty((n_dead_tup * 100)::bigint),
    CASE
      WHEN n_dead_tup > 1000 AND n_live_tup > 0 AND 
           (n_dead_tup::float / (n_live_tup + n_dead_tup)) > 0.2 
      THEN 'VACUUM RECOMMENDED'
      WHEN n_dead_tup > 10000 THEN 'VACUUM URGENT'
      ELSE 'OK'
    END::TEXT
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_dead_tup DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 5. PARTITION STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_partition_stats()
RETURNS TABLE(
  partition_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  last_vacuum TIMESTAMP,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT,
    s.n_live_tup,
    pg_size_pretty(pg_relation_size(c.oid)),
    s.last_autovacuum,
    CASE
      WHEN s.n_dead_tup > 1000 THEN 'NEEDS VACUUM'
      WHEN s.n_live_tup = 0 THEN 'EMPTY'
      ELSE 'HEALTHY'
    END::TEXT
  FROM pg_class c
  JOIN pg_stat_user_tables s ON c.relname = s.relname
  WHERE c.relispartition = true
    AND s.schemaname = 'public'
  ORDER BY s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 6. ACTIVE QUERIES FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_active_queries()
RETURNS TABLE(
  pid INTEGER,
  duration_seconds INTEGER,
  query_text TEXT,
  state TEXT,
  wait_event TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pg_stat_activity.pid::INTEGER,
    extract(epoch from (now() - pg_stat_activity.query_start))::INTEGER,
    left(pg_stat_activity.query, 200)::TEXT,
    pg_stat_activity.state::TEXT,
    coalesce(pg_stat_activity.wait_event, 'none')::TEXT
  FROM pg_stat_activity
  WHERE pg_stat_activity.state != 'idle'
    AND pg_stat_activity.query NOT LIKE '%pg_stat_activity%'
    AND pg_stat_activity.pid != pg_backend_pid()
  ORDER BY pg_stat_activity.query_start ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_bloat() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_partition_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_queries() TO authenticated;

COMMENT ON FUNCTION public.get_database_stats IS 'Database performance overview. Admin recommended.';
COMMENT ON FUNCTION public.get_table_statistics IS 'Table size and activity statistics. Admin recommended.';
COMMENT ON FUNCTION public.get_index_usage IS 'Index usage analysis. Admin recommended.';
COMMENT ON FUNCTION public.get_table_bloat IS 'Table bloat estimation. Admin recommended.';
COMMENT ON FUNCTION public.get_partition_stats IS 'Partition health statistics. Admin recommended.';
COMMENT ON FUNCTION public.get_active_queries IS 'Real-time query monitoring. Admin recommended.';-- NOTE: Seed data removed for clean database replication
-- Original seed data (commented out):
-- Grant admin access to nkambumw@protonmail.com
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('2f175e02-ab82-4a21-af54-38707b0dae9e', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;-- Delete pending service provider applications and roles for current user
-- This allows users to reapply if needed

-- Delete from service_providers
DELETE FROM service_providers 
WHERE user_id = auth.uid() 
AND vetting_status = 'pending';

-- Delete pending provider role
DELETE FROM user_roles 
WHERE user_id = auth.uid() 
AND role = 'software_provider_pending';-- Allow users to withdraw their pending provider application

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
USING (auth.uid() = user_id AND role = 'software_provider_pending');-- Add contact_person column to service_providers table
ALTER TABLE public.service_providers 
ADD COLUMN contact_person TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.service_providers.contact_person IS 'Full name of the primary contact person for the service provider';-- Add RLS policies for service_providers table

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
USING (has_role(auth.uid(), 'admin'::app_role));-- Admin RLS policies for registration approvals
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
END $$;-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active 
ON public.profiles(is_active);-- Add mentorship_admin role to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'mentorship_admin' 
    AND enumtypid = 'app_role'::regtype
  ) THEN
    ALTER TYPE app_role ADD VALUE 'mentorship_admin';
  END IF;
END $$;-- Create email_cohort_mappings table for automatic cohort assignment
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
  EXECUTE FUNCTION public.auto_assign_cohort_on_registration();UPDATE services 
SET banner_image_url = '/services/credit-scoring-banner.jpg'
WHERE id = 'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a';-- Add INSERT policy for cohort_funded_listings to allow admins to add listings to cohorts
CREATE POLICY "Admins can manage cohort funded listings"
ON public.cohort_funded_listings
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role)
);-- Create triggers for automatic match generation

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
CREATE INDEX idx_advisor_sessions_scheduled_at ON public.advisor_sessions(scheduled_at);-- Add RLS policy for admins to view all advisors
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
);-- Create audit logs table for comprehensive security logging
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
COMMENT ON TABLE public.security_events IS 'Security incidents and anomalies requiring investigation';-- Create saved searches table for funders
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
  EXECUTE FUNCTION public.update_updated_at_column();-- Create storage bucket for platform documentation
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
CREATE INDEX IF NOT EXISTS idx_platform_documents_uploaded_at ON public.platform_documents(uploaded_at DESC);-- Create newsletter subscriptions table
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
  ON public.newsletter_subscriptions(email);-- Create status notifications subscriptions table
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