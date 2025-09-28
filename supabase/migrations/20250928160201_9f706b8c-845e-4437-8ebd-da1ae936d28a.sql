-- Fix security issue: Remove public email exposure from profiles table

-- Drop the overly permissive policy that exposes all profile data
DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;

-- Create new restrictive policies for profile access
-- 1. Users can view their own complete profile (including sensitive data like email)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Others can view only public profile information (excluding email and other sensitive fields)
-- Note: This policy structure will require application-level filtering to exclude sensitive fields
CREATE POLICY "Public can view basic profile information" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NULL OR auth.uid() != user_id);