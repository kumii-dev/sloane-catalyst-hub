-- Add comprehensive profile fields for smart matching

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
  EXECUTE FUNCTION calculate_profile_completion();