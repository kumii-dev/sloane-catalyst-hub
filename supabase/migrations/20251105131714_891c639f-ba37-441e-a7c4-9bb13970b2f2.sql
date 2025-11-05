-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.learning_path_courses CASCADE;
DROP TABLE IF EXISTS public.learning_paths CASCADE;
DROP TABLE IF EXISTS public.course_recommendations CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.learning_badges CASCADE;
DROP TABLE IF EXISTS public.course_reviews CASCADE;
DROP TABLE IF EXISTS public.learning_progress CASCADE;
DROP TABLE IF EXISTS public.course_enrollments CASCADE;
DROP TABLE IF EXISTS public.course_lessons CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.learning_providers CASCADE;

-- Create learning_providers table
CREATE TABLE public.learning_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  logo_url TEXT,
  bio TEXT,
  website TEXT,
  accreditations JSONB DEFAULT '[]'::jsonb,
  specializations TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  total_courses INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  revenue_share_percentage INTEGER DEFAULT 70,
  provider_status TEXT DEFAULT 'active' CHECK (provider_status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.learning_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  video_preview_url TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('self_paced', 'instructor_led', 'blended', 'live_workshop')),
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('online', 'in_person', 'hybrid')),
  duration_hours INTEGER,
  duration_text TEXT,
  language TEXT DEFAULT 'en',
  prerequisites TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'ZAR',
  is_free BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  total_enrollments INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  certificate_enabled BOOLEAN DEFAULT true,
  has_assessment BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 70,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_lessons table
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'assignment', 'discussion', 'scorm', 'live_session')),
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'sponsored')),
  payment_amount DECIMAL(10,2),
  payment_reference TEXT,
  recommended_by UUID REFERENCES auth.users(id),
  notes TEXT,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Create learning_progress table
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_position TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Create course_reviews table
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.course_enrollments(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_completion BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Create learning_badges table
CREATE TABLE public.learning_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  badge_image_url TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('course_completion', 'skill_mastery', 'learning_path', 'streak', 'achievement')),
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  is_stackable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.learning_badges(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_showcased BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id, course_id)
);

-- Create course_recommendations table
CREATE TABLE public.course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('ai_match', 'mentor_recommended', 'skill_gap', 'popular', 'similar_learners')),
  match_score INTEGER,
  match_reasons TEXT[] DEFAULT '{}',
  recommended_by UUID REFERENCES auth.users(id),
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning_paths table
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.learning_providers(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'beginner',
  estimated_duration_hours INTEGER,
  total_courses INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning_path_courses table
CREATE TABLE public.learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(learning_path_id, course_id)
);

-- Create indexes
CREATE INDEX idx_courses_provider ON public.courses(provider_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_search_vector ON public.courses USING gin(search_vector);
CREATE INDEX idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX idx_learning_progress_user ON public.learning_progress(user_id);
CREATE INDEX idx_course_recommendations_user ON public.course_recommendations(user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- Enable RLS
ALTER TABLE public.learning_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Providers viewable by everyone" ON public.learning_providers FOR SELECT USING (provider_status = 'active');
CREATE POLICY "Users can create provider profile" ON public.learning_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update own profile" ON public.learning_providers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Published courses viewable by everyone" ON public.courses FOR SELECT USING (status = 'published');
CREATE POLICY "Providers can manage own courses" ON public.courses FOR ALL USING (EXISTS (SELECT 1 FROM public.learning_providers WHERE learning_providers.id = courses.provider_id AND learning_providers.user_id = auth.uid()));

CREATE POLICY "Modules viewable with course" ON public.course_modules FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.status = 'published'));
CREATE POLICY "Providers can manage own modules" ON public.course_modules FOR ALL USING (EXISTS (SELECT 1 FROM public.courses c JOIN public.learning_providers lp ON lp.id = c.provider_id WHERE c.id = course_modules.course_id AND lp.user_id = auth.uid()));

CREATE POLICY "Lessons viewable by enrolled or preview" ON public.course_lessons FOR SELECT USING (is_preview = true OR EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_enrollments.course_id = course_lessons.course_id AND course_enrollments.user_id = auth.uid()));
CREATE POLICY "Providers can manage own lessons" ON public.course_lessons FOR ALL USING (EXISTS (SELECT 1 FROM public.courses c JOIN public.learning_providers lp ON lp.id = c.provider_id WHERE c.id = course_lessons.course_id AND lp.user_id = auth.uid()));

CREATE POLICY "Users can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll in courses" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can view enrollments for their courses" ON public.course_enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses c JOIN public.learning_providers lp ON lp.id = c.provider_id WHERE c.id = course_enrollments.course_id AND lp.user_id = auth.uid()));

CREATE POLICY "Users can view own progress" ON public.learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.learning_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Reviews viewable by everyone" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Badges viewable by everyone" ON public.learning_badges FOR SELECT USING (true);
CREATE POLICY "User badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "Users can view own recommendations" ON public.course_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.course_recommendations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Published paths viewable by everyone" ON public.learning_paths FOR SELECT USING (is_published = true);
CREATE POLICY "Providers can manage own paths" ON public.learning_paths FOR ALL USING (EXISTS (SELECT 1 FROM public.learning_providers WHERE learning_providers.id = learning_paths.provider_id AND learning_providers.user_id = auth.uid()));

CREATE POLICY "Path courses viewable with path" ON public.learning_path_courses FOR SELECT USING (EXISTS (SELECT 1 FROM public.learning_paths WHERE learning_paths.id = learning_path_courses.learning_path_id AND learning_paths.is_published = true));

-- Triggers and Functions
CREATE OR REPLACE FUNCTION update_course_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION update_course_search_vector();

CREATE OR REPLACE FUNCTION update_course_enrollment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses SET total_enrollments = total_enrollments + 1 WHERE id = NEW.course_id;
    UPDATE public.learning_providers lp SET total_enrollments = total_enrollments + 1 FROM public.courses c WHERE c.id = NEW.course_id AND lp.id = c.provider_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE public.courses SET total_completions = total_completions + 1 WHERE id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_enrollment_stats_trigger
  AFTER INSERT OR UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_stats();

CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.courses SET 
    average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.course_reviews WHERE course_id = NEW.course_id),
    total_reviews = (SELECT COUNT(*) FROM public.course_reviews WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_rating_trigger
  AFTER INSERT OR UPDATE ON public.course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();