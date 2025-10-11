-- Create mentor availability table
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specific date overrides for availability
CREATE TABLE IF NOT EXISTS public.mentor_date_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_date_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for mentor_availability
CREATE POLICY "Availability viewable by everyone"
  ON public.mentor_availability FOR SELECT
  USING (is_active = true);

CREATE POLICY "Mentors can manage their availability"
  ON public.mentor_availability FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentors WHERE id = mentor_availability.mentor_id
    )
  );

-- Policies for mentor_date_overrides
CREATE POLICY "Date overrides viewable by everyone"
  ON public.mentor_date_overrides FOR SELECT
  USING (true);

CREATE POLICY "Mentors can manage their date overrides"
  ON public.mentor_date_overrides FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.mentors WHERE id = mentor_date_overrides.mentor_id
    )
  );

-- Add session_fee to mentors table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mentors' AND column_name = 'session_fee') THEN
    ALTER TABLE public.mentors ADD COLUMN session_fee NUMERIC DEFAULT 100;
  END IF;
END $$;

-- Add platform_fee_percentage to mentors table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mentors' AND column_name = 'platform_fee_percentage') THEN
    ALTER TABLE public.mentors ADD COLUMN platform_fee_percentage NUMERIC DEFAULT 25;
  END IF;
END $$;