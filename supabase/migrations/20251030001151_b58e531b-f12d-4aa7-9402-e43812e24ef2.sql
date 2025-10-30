-- Add RLS policy for admins to view all advisors
CREATE POLICY "Admins can view all advisors"
ON public.advisors
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role) OR
  vetting_status = 'approved'
);

-- Add RLS policy for admins to update advisors
CREATE POLICY "Admins can update advisors"
ON public.advisors
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentorship_admin'::app_role) OR
  auth.uid() = user_id
);