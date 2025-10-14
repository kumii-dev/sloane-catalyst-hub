-- Recreate the public_profiles view with SECURITY INVOKER
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
FROM public.profiles;