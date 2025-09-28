-- Create funding hub tables
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
CREATE TRIGGER update_funding_applications_updated_at BEFORE UPDATE ON public.funding_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();