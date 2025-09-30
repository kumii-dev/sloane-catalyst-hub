-- Add persona tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization TEXT;

-- Create enum for persona types
CREATE TYPE public.persona_type AS ENUM (
  'unassigned',
  'smme_startup',
  'job_seeker',
  'funder',
  'service_provider',
  'mentor_advisor',
  'public_private_entity'
);

-- Update persona_type column to use enum
ALTER TABLE public.profiles ALTER COLUMN persona_type TYPE persona_type USING persona_type::persona_type;
ALTER TABLE public.profiles ALTER COLUMN persona_type SET DEFAULT 'unassigned'::persona_type;

-- Create progressive profiling data table
CREATE TABLE IF NOT EXISTS public.progressive_profile_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_type persona_type NOT NULL,
  field_name TEXT NOT NULL,
  field_value JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, persona_type, field_name)
);

-- Enable RLS
ALTER TABLE public.progressive_profile_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progressive_profile_data
CREATE POLICY "Users can view their own profile data"
ON public.progressive_profile_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data"
ON public.progressive_profile_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data"
ON public.progressive_profile_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Update existing profiles to have default persona
UPDATE public.profiles SET persona_type = 'unassigned'::persona_type WHERE persona_type IS NULL;