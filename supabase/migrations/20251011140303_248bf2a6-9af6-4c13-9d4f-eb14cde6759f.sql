-- NOTE: Seed data removed for clean database replication
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
