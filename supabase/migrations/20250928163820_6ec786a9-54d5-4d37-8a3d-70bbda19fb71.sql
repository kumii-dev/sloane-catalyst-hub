-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.service_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_cohort_partner BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service types enum
CREATE TYPE public.service_type AS ENUM ('subscription', 'one_time', 'session_based', 'custom');

-- Create pricing types enum
CREATE TYPE public.pricing_type AS ENUM ('free', 'freemium', 'paid', 'credits_only', 'contact_for_pricing');

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  key_features TEXT[],
  target_industries TEXT[],
  service_type service_type NOT NULL,
  pricing_type pricing_type NOT NULL,
  base_price DECIMAL(10,2),
  credits_price INTEGER,
  cohort_benefits TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_subscribers INTEGER DEFAULT 0,
  banner_image_url TEXT,
  gallery_images TEXT[],
  demo_url TEXT,
  documentation_url TEXT,
  terms_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service reviews table
CREATE TABLE public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, user_id)
);

-- Create service subscriptions table
CREATE TABLE public.service_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subscription_status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for service_providers
CREATE POLICY "Providers are viewable by everyone" 
ON public.service_providers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own provider profile" 
ON public.service_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile" 
ON public.service_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Active services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Providers can manage their services" 
ON public.services 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.service_providers 
  WHERE id = services.provider_id
));

-- RLS Policies for service_reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.service_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.service_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.service_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for service_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.service_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.service_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.service_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_service_categories_parent_id ON public.service_categories(parent_id);
CREATE INDEX idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_featured ON public.services(is_featured, is_active);
CREATE INDEX idx_service_reviews_service_id ON public.service_reviews(service_id);
CREATE INDEX idx_service_subscriptions_user_id ON public.service_subscriptions(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_subscriptions_updated_at
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service categories
INSERT INTO public.service_categories (name, description, icon, slug, sort_order) VALUES
('Software Services', 'CRM, ERP, Accounting, HR, Marketing, Security, Analytics, AI tools', 'Code', 'software-services', 1),
('Professional & Ancillary Services', 'Accounting, Legal, Governance, Compliance, Business Advisory', 'Briefcase', 'professional-services', 2),
('Growth & Development Services', 'Mentorship, Skills Training, Hackathons, Events, Innovation Labs', 'TrendingUp', 'growth-development', 3);

-- Insert subcategories for Software Services
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('CRM & Sales', 'Customer relationship management and sales tools', 'Users', 'crm-sales', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 1),
('Accounting & Finance', 'Financial management and accounting software', 'Calculator', 'accounting-finance', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 2),
('Marketing & Analytics', 'Marketing automation and analytics platforms', 'BarChart', 'marketing-analytics', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 3),
('HR & Productivity', 'Human resources and productivity tools', 'Clock', 'hr-productivity', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 4),
('Security & Compliance', 'Cybersecurity and compliance solutions', 'Shield', 'security-compliance', (SELECT id FROM public.service_categories WHERE slug = 'software-services'), 5);

-- Insert subcategories for Professional Services
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('Legal Services', 'Legal advice and compliance support', 'Scale', 'legal-services', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 1),
('Business Advisory', 'Strategic business consulting and advisory', 'Target', 'business-advisory', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 2),
('Market Access', 'Market entry and expansion services', 'Globe', 'market-access', (SELECT id FROM public.service_categories WHERE slug = 'professional-services'), 3);

-- Insert subcategories for Growth & Development
INSERT INTO public.service_categories (name, description, icon, slug, parent_id, sort_order) VALUES
('Skills Training', 'Professional development and skills training', 'GraduationCap', 'skills-training', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 1),
('Innovation Labs', 'Innovation workshops and labs', 'Lightbulb', 'innovation-labs', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 2),
('Events & Networking', 'Conferences, hackathons, and networking events', 'Calendar', 'events-networking', (SELECT id FROM public.service_categories WHERE slug = 'growth-development'), 3);