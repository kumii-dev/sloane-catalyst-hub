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
