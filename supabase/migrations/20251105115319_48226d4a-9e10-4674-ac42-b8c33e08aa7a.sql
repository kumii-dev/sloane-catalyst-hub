-- Learning Management System Tables

-- Course providers (extends existing roles)
CREATE TABLE IF NOT EXISTS learning_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  logo_url TEXT,
  accreditation_info TEXT,
  bio TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  total_courses INTEGER DEFAULT 0,
  total_learners INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Courses/Learning Modules
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES learning_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL, -- Finance, Marketing, Tech, Legal, Operations, etc.
  subcategory TEXT,
  level TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
  delivery_type TEXT NOT NULL, -- online_course, workshop, webinar, masterclass, resource_pack
  delivery_mode TEXT NOT NULL, -- self_paced, live, blended
  duration_hours INTEGER,
  duration_text TEXT, -- e.g., "4 weeks", "2 days"
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'ZAR',
  is_free BOOLEAN DEFAULT true,
  learning_outcomes TEXT[],
  prerequisites TEXT[],
  target_audience TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'draft', -- draft, published, archived
  is_featured BOOLEAN DEFAULT false,
  video_preview_url TEXT,
  total_enrollments INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  certificate_enabled BOOLEAN DEFAULT true,
  has_assessment BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 70,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course modules/lessons
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- video, document, quiz, scorm, embed, text
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'enrolled', -- enrolled, in_progress, completed, dropped
  payment_status TEXT DEFAULT 'pending', -- pending, paid, free, sponsored
  payment_amount NUMERIC(10,2),
  payment_reference TEXT,
  recommended_by UUID REFERENCES auth.users(id),
  certificate_issued_at TIMESTAMPTZ,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Learning progress tracking
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  attempts INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Course reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_completion BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Badges and certificates
CREATE TABLE IF NOT EXISTS learning_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  badge_image_url TEXT,
  badge_type TEXT NOT NULL, -- course_completion, skill_mastery, milestone, achievement
  criteria TEXT,
  issuer_name TEXT NOT NULL,
  issuer_logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES learning_badges(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  enrollment_id UUID REFERENCES course_enrollments(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  is_displayed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course recommendations
CREATE TABLE IF NOT EXISTS course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommended_by UUID REFERENCES auth.users(id),
  recommendation_type TEXT NOT NULL, -- ai_match, mentor_suggestion, pathway, trending
  match_score INTEGER,
  match_reasons TEXT[],
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, recommendation_type)
);

-- Learning paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES learning_providers(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  level TEXT,
  estimated_duration_hours INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_providers
CREATE POLICY "Providers viewable by everyone" ON learning_providers FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can create provider profile" ON learning_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own provider profile" ON learning_providers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Published courses viewable by everyone" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Providers can manage own courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM learning_providers WHERE learning_providers.id = courses.provider_id AND learning_providers.user_id = auth.uid())
);

-- RLS Policies for course_modules
CREATE POLICY "Modules viewable with course" ON course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_modules.course_id AND courses.status = 'published')
);
CREATE POLICY "Providers can manage own modules" ON course_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN learning_providers lp ON lp.id = c.provider_id
    WHERE c.id = course_modules.course_id AND lp.user_id = auth.uid()
  )
);

-- RLS Policies for course_lessons
CREATE POLICY "Lessons viewable by enrolled or preview" ON course_lessons FOR SELECT USING (
  is_preview = true OR
  EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.course_id = course_lessons.course_id AND course_enrollments.user_id = auth.uid())
);
CREATE POLICY "Providers can manage own lessons" ON course_lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN learning_providers lp ON lp.id = c.provider_id
    WHERE c.id = course_lessons.course_id AND lp.user_id = auth.uid()
  )
);

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll in courses" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON course_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can view enrollments for their courses" ON course_enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN learning_providers lp ON lp.id = c.provider_id
    WHERE c.id = course_enrollments.course_id AND lp.user_id = auth.uid()
  )
);

-- RLS Policies for learning_progress
CREATE POLICY "Users can view own progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for course_reviews
CREATE POLICY "Reviews viewable by everyone" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_badges
CREATE POLICY "Badges viewable by everyone" ON learning_badges FOR SELECT USING (is_active = true);

-- RLS Policies for user_badges
CREATE POLICY "User badges viewable by everyone" ON user_badges FOR SELECT USING (is_displayed = true);
CREATE POLICY "Users can update own badge display" ON user_badges FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for course_recommendations
CREATE POLICY "Users can view own recommendations" ON course_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON course_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_paths
CREATE POLICY "Published paths viewable by everyone" ON learning_paths FOR SELECT USING (is_published = true);
CREATE POLICY "Providers can manage own paths" ON learning_paths FOR ALL USING (
  EXISTS (SELECT 1 FROM learning_providers WHERE learning_providers.id = learning_paths.provider_id AND learning_providers.user_id = auth.uid())
);

-- RLS Policies for learning_path_courses
CREATE POLICY "Path courses viewable with path" ON learning_path_courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM learning_paths WHERE learning_paths.id = learning_path_courses.path_id AND learning_paths.is_published = true)
);

-- Indexes for performance
CREATE INDEX idx_courses_provider ON courses(provider_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_search ON courses USING gin(search_vector);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_course_lessons_course ON course_lessons(course_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_progress_enrollment ON learning_progress(enrollment_id);
CREATE INDEX idx_progress_user ON learning_progress(user_id);
CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_recommendations_user ON course_recommendations(user_id);

-- Function to update course search vector
CREATE OR REPLACE FUNCTION update_courses_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_search_vector_update
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_search_vector();

-- Function to update course statistics
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE courses SET
      total_enrollments = (SELECT COUNT(*) FROM course_enrollments WHERE course_id = NEW.course_id),
      total_completions = (SELECT COUNT(*) FROM course_enrollments WHERE course_id = NEW.course_id AND status = 'completed'),
      updated_at = now()
    WHERE id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_stats_update
  AFTER INSERT OR UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

-- Function to update course rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses SET
    average_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM course_reviews WHERE course_id = NEW.course_id),
    total_reviews = (SELECT COUNT(*) FROM course_reviews WHERE course_id = NEW.course_id),
    updated_at = now()
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_review_stats_update
  AFTER INSERT OR UPDATE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- Add learning provider role to user_roles enum if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'startup', 'mentor', 'funder', 'service_provider', 'learning_provider');
  ELSE
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'learning_provider';
  END IF;
END $$;