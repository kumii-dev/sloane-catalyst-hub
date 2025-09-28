-- Create enum for resource types
CREATE TYPE public.resource_type AS ENUM (
  'article',
  'template',
  'video',
  'course',
  'tool',
  'calculator',
  'checklist',
  'case_study',
  'guide',
  'webinar',
  'podcast'
);

-- Create enum for resource access levels
CREATE TYPE public.access_level AS ENUM (
  'public',
  'registered',
  'cohort_only',
  'premium'
);

-- Create resource categories table
CREATE TABLE public.resource_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.resource_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  resource_type resource_type NOT NULL,
  access_level access_level DEFAULT 'public',
  category_id UUID REFERENCES public.resource_categories(id),
  author_name TEXT,
  author_bio TEXT,
  thumbnail_url TEXT,
  file_url TEXT,
  external_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT,
  tags TEXT[],
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  cohort_benefits TEXT,
  sponsor_name TEXT,
  sponsor_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource bookmarks table
CREATE TABLE public.resource_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create resource progress table (for courses/videos)
CREATE TABLE public.resource_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create resource ratings table
CREATE TABLE public.resource_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create events table for community events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  banner_image_url TEXT,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'registered',
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resource_categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.resource_categories 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for resources
CREATE POLICY "Public resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (is_active = true AND access_level = 'public');

CREATE POLICY "Registered users can view registered resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_active = true AND access_level IN ('public', 'registered'));

CREATE POLICY "Cohort users can view cohort resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_active = true AND access_level IN ('public', 'registered', 'cohort_only'));

-- Create RLS policies for resource_bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.resource_bookmarks 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for resource_progress
CREATE POLICY "Users can manage their own progress" 
ON public.resource_progress 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for resource_ratings
CREATE POLICY "Ratings are viewable by everyone" 
ON public.resource_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings" 
ON public.resource_ratings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.resource_ratings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Active events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for event_registrations
CREATE POLICY "Users can manage their own registrations" 
ON public.event_registrations 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_resources_category_id ON public.resources(category_id);
CREATE INDEX idx_resources_type ON public.resources(resource_type);
CREATE INDEX idx_resources_access_level ON public.resources(access_level);
CREATE INDEX idx_resources_featured ON public.resources(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX idx_resource_bookmarks_user_id ON public.resource_bookmarks(user_id);
CREATE INDEX idx_resource_progress_user_id ON public.resource_progress(user_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_resource_categories_updated_at
  BEFORE UPDATE ON public.resource_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_progress_updated_at
  BEFORE UPDATE ON public.resource_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_ratings_updated_at
  BEFORE UPDATE ON public.resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default resource categories
INSERT INTO public.resource_categories (name, slug, description, icon, sort_order) VALUES
('Learning Hub', 'learning-hub', 'Digital skills, entrepreneurial training, and work skills development', 'GraduationCap', 1),
('Knowledge Library', 'knowledge-library', 'Articles, guides, templates, and case studies', 'BookOpen', 2),
('Tools & Downloads', 'tools-downloads', 'Business calculators, starter kits, and checklists', 'Download', 3),
('Community & Networking', 'community-networking', 'Events, forums, and networking opportunities', 'Users', 4),
('Support & Help Center', 'support-help', 'FAQs, tutorials, and support resources', 'HelpCircle', 5);

-- Insert subcategories for Learning Hub
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Digital Skills Courses', 'digital-skills', 'Technology and digital literacy courses', 'Monitor', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 1),
('Entrepreneurial Skills', 'entrepreneurial-skills', 'Business development and entrepreneurship training', 'Briefcase', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 2),
('Work Skills Development', 'work-skills', 'Professional development and soft skills', 'TrendingUp', (SELECT id FROM public.resource_categories WHERE slug = 'learning-hub'), 3);

-- Insert subcategories for Knowledge Library
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Articles & Guides', 'articles-guides', 'How-to guides and informational articles', 'FileText', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 1),
('Templates', 'templates', 'Business templates and document templates', 'Layout', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 2),
('Case Studies', 'case-studies', 'Success stories and real-world examples', 'Award', (SELECT id FROM public.resource_categories WHERE slug = 'knowledge-library'), 3);

-- Insert subcategories for Tools & Downloads
INSERT INTO public.resource_categories (name, slug, description, icon, parent_id, sort_order) VALUES
('Business Calculators', 'calculators', 'Financial and business calculation tools', 'Calculator', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 1),
('Starter Kits', 'starter-kits', 'CRM, ERP, and business tool starter packages', 'Package', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 2),
('Compliance Checklists', 'compliance', 'Regulatory and compliance resources', 'CheckSquare', (SELECT id FROM public.resource_categories WHERE slug = 'tools-downloads'), 3);