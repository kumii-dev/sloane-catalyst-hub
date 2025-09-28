-- Create enum types for mentorship system
CREATE TYPE public.mentor_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE public.session_type AS ENUM ('free', 'premium');
CREATE TYPE public.session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentors table
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  company TEXT,
  experience_years INTEGER,
  expertise_areas TEXT[],
  hourly_rate DECIMAL(10,2),
  status mentor_status NOT NULL DEFAULT 'available',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentoring sessions table
CREATE TABLE public.mentoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_type session_type NOT NULL,
  session_status session_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.mentoring_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor-category junction table
CREATE TABLE public.mentor_categories (
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.mentoring_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentors
CREATE POLICY "Mentors are viewable by everyone" 
ON public.mentors FOR SELECT USING (true);

CREATE POLICY "Users can insert their own mentor profile" 
ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile" 
ON public.mentors FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentoring_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.mentoring_sessions FOR SELECT 
USING (
  auth.uid() = mentee_id OR 
  auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id)
);

CREATE POLICY "Mentees can create sessions" 
ON public.mentoring_sessions FOR INSERT 
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors and mentees can update their sessions" 
ON public.mentoring_sessions FOR UPDATE 
USING (
  auth.uid() = mentee_id OR 
  auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id)
);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.mentoring_categories FOR SELECT USING (true);

CREATE POLICY "Mentor categories are viewable by everyone" 
ON public.mentor_categories FOR SELECT USING (true);

CREATE POLICY "Mentors can manage their categories" 
ON public.mentor_categories FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.mentors WHERE id = mentor_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_sessions_updated_at
  BEFORE UPDATE ON public.mentoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.mentoring_categories (name, description, icon) VALUES
('Technology', 'Software development, AI, data science', 'Code'),
('Business', 'Strategy, entrepreneurship, leadership', 'Briefcase'),
('Design', 'UI/UX, graphic design, product design', 'Palette'),
('Marketing', 'Digital marketing, growth, branding', 'TrendingUp'),
('Career', 'Career transitions, interviews, networking', 'User'),
('Finance', 'Investment, financial planning, fintech', 'DollarSign');