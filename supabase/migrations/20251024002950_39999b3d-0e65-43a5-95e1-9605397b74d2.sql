-- Backfill existing users who don't have profiles
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
ON CONFLICT (user_id) DO NOTHING;