-- Update the handle_new_user function to handle duplicate profile inserts gracefully
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
$$;