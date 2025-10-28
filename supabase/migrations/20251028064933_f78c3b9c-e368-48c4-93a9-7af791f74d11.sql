-- Add RLS policies for service_providers table

-- Allow users to insert their own provider application
CREATE POLICY "Users can create their own provider application"
ON public.service_providers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own provider profile
CREATE POLICY "Users can view their own provider profile"
ON public.service_providers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own provider profile
CREATE POLICY "Users can update their own provider profile"
ON public.service_providers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all provider profiles
CREATE POLICY "Admins can view all provider profiles"
ON public.service_providers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update provider profiles (for vetting)
CREATE POLICY "Admins can update provider profiles"
ON public.service_providers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));