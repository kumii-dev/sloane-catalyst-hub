-- Add unique constraint on user_id for mentors table
-- This ensures each user can only have one mentor profile
ALTER TABLE public.mentors 
ADD CONSTRAINT mentors_user_id_unique UNIQUE (user_id);