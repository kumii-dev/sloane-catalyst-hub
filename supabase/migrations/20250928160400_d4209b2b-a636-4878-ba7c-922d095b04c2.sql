-- Fix security issue: Remove public email exposure from profiles table

-- Just remove the insecure policy that exposes all profile data
-- The secure policies may already exist from previous attempts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;