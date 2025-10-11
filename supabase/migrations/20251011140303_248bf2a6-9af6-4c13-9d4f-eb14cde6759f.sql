
-- Create profile for the user if it doesn't exist
INSERT INTO public.profiles (user_id, email, first_name, last_name)
VALUES (
  '314e0504-5bb7-4980-887a-2a076321b5d1',
  'nkambumw@gmail.com',
  'Mafika',
  'Nkambule'
)
ON CONFLICT (user_id) DO NOTHING;

-- Grant admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('314e0504-5bb7-4980-887a-2a076321b5d1', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
