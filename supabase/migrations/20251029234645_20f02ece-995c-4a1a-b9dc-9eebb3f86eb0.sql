-- Create advisors table (separate from mentors)
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT,
  years_experience INTEGER,
  bio TEXT,
  expertise_areas TEXT[],
  specializations TEXT[],
  hourly_rate DECIMAL(10,2),
  is_premium BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'on_break')),
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  vetting_status TEXT DEFAULT 'pending' CHECK (vetting_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Create policies for advisors
CREATE POLICY "Advisors are viewable by everyone"
ON public.advisors FOR SELECT
USING (vetting_status = 'approved');

CREATE POLICY "Users can insert their own advisor profile"
ON public.advisors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisor profile"
ON public.advisors FOR UPDATE
USING (auth.uid() = user_id);

-- Create advisor categories table
CREATE TABLE public.advisor_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, category_id)
);

ALTER TABLE public.advisor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor categories are viewable by everyone"
ON public.advisor_categories FOR SELECT
USING (true);

CREATE POLICY "Advisors can manage their own categories"
ON public.advisor_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create advisor availability table
CREATE TABLE public.advisor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor availability is viewable by everyone"
ON public.advisor_availability FOR SELECT
USING (true);

CREATE POLICY "Advisors can manage their own availability"
ON public.advisor_availability FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create advisor sessions table (separate from mentor sessions)
CREATE TABLE public.advisor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_type TEXT DEFAULT 'advisory' CHECK (session_type IN ('advisory', 'coaching', 'consulting')),
  meeting_link TEXT,
  notes TEXT,
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advisor sessions"
ON public.advisor_sessions FOR SELECT
USING (
  auth.uid() = client_user_id OR
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create advisor sessions"
ON public.advisor_sessions FOR INSERT
WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Participants can update advisor sessions"
ON public.advisor_sessions FOR UPDATE
USING (
  auth.uid() = client_user_id OR
  EXISTS (
    SELECT 1 FROM public.advisors
    WHERE id = advisor_id AND user_id = auth.uid()
  )
);

-- Create search vector function for advisors
CREATE OR REPLACE FUNCTION public.update_advisors_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.expertise_areas, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.specializations, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_advisors_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.advisors
FOR EACH ROW EXECUTE FUNCTION public.update_advisors_search_vector();

-- Create function to check if user is advisor
CREATE OR REPLACE FUNCTION public.is_advisor(_advisor_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.advisors
    WHERE id = _advisor_id
      AND user_id = _user_id
  )
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_advisors_updated_at
BEFORE UPDATE ON public.advisors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_availability_updated_at
BEFORE UPDATE ON public.advisor_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_sessions_updated_at
BEFORE UPDATE ON public.advisor_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_advisors_user_id ON public.advisors(user_id);
CREATE INDEX idx_advisors_status ON public.advisors(status);
CREATE INDEX idx_advisors_vetting_status ON public.advisors(vetting_status);
CREATE INDEX idx_advisors_search_vector ON public.advisors USING gin(search_vector);
CREATE INDEX idx_advisor_sessions_advisor_id ON public.advisor_sessions(advisor_id);
CREATE INDEX idx_advisor_sessions_client_user_id ON public.advisor_sessions(client_user_id);
CREATE INDEX idx_advisor_sessions_scheduled_at ON public.advisor_sessions(scheduled_at);