-- Enable public read access to mentor profiles and related data
-- This allows non-authenticated users to view mentor profiles

-- Allow public read access to profiles (for mentor information)
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
CREATE POLICY "Public can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Allow public read access to session reviews (so people can see mentor reviews)
DROP POLICY IF EXISTS "Public can view session reviews" ON public.session_reviews;
CREATE POLICY "Public can view session reviews"
ON public.session_reviews
FOR SELECT
TO public
USING (true);

-- Note: mentors and mentor_categories already have public SELECT policies
-- mentoring_sessions table remains protected for authenticated participants only