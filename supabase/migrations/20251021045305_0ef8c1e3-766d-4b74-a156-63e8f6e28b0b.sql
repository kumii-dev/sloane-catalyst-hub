-- Add total_reviews column to mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;

-- Update existing mentors with their current review count
UPDATE public.mentors m
SET total_reviews = (
  SELECT COUNT(*)
  FROM public.session_reviews sr
  WHERE sr.reviewee_id = m.user_id
);