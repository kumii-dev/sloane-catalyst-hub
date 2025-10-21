-- Backfill mentors' rating and total_reviews based on existing session_reviews
-- This ensures profiles and dashboards reflect current data even for reviews created before triggers existed

-- Update mentors that have at least one review
UPDATE public.mentors m
SET 
  rating = COALESCE(r.avg_rating, 0),
  total_reviews = COALESCE(r.total_reviews, 0),
  updated_at = now()
FROM (
  SELECT 
    reviewee_id AS mentor_user_id,
    ROUND(AVG(rating)::numeric * 10)/10 AS avg_rating,
    COUNT(*) AS total_reviews
  FROM public.session_reviews
  GROUP BY reviewee_id
) r
WHERE m.user_id = r.mentor_user_id;

-- Normalize mentors with no reviews to zero values
UPDATE public.mentors m
SET 
  rating = 0,
  total_reviews = 0,
  updated_at = now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.session_reviews sr WHERE sr.reviewee_id = m.user_id
);
