-- Comprehensive Matching Engine System for Kumii Platform

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
  EXECUTE FUNCTION public.update_updated_at_column();