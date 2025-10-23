-- Fix security warnings by setting search_path on new functions

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
$$;