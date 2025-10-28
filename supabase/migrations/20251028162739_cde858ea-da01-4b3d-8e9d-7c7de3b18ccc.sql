-- Add INSERT policy for cohort_funded_listings to allow admins to add listings to cohorts
CREATE POLICY "Admins can manage cohort funded listings"
ON public.cohort_funded_listings
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role)
);