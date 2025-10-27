-- Add full-text search to key tables

-- PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON public.profiles USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_profiles_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.organization, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.skills, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.interests, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_search_vector_trigger BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_search_vector();

-- MENTORS
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_mentors_search_vector ON public.mentors USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_mentors_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.expertise_areas, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.specializations, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mentors_search_vector_trigger BEFORE INSERT OR UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_mentors_search_vector();

-- RESOURCES
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON public.resources USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_resources_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.author_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resources_search_vector_trigger BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_resources_search_vector();

-- SERVICES
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_services_search_vector ON public.services USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_services_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.key_features, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_services_search_vector_trigger BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_services_search_vector();

-- FUNDING_OPPORTUNITIES
ALTER TABLE public.funding_opportunities ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_search_vector ON public.funding_opportunities USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_funding_opportunities_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.requirements, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_funding_opportunities_search_vector_trigger BEFORE INSERT OR UPDATE ON public.funding_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_funding_opportunities_search_vector();

-- STARTUP_PROFILES
ALTER TABLE public.startup_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_startup_profiles_search_vector ON public.startup_profiles USING gin(search_vector);

CREATE OR REPLACE FUNCTION public.update_startup_profiles_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.industry, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_startup_profiles_search_vector_trigger BEFORE INSERT OR UPDATE ON public.startup_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_startup_profiles_search_vector();

-- GLOBAL SEARCH FUNCTION
CREATE OR REPLACE FUNCTION public.search_all(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE(result_type TEXT, result_id UUID, title TEXT, description TEXT, rank REAL) AS $$
BEGIN
  RETURN QUERY (
    SELECT 'profile'::TEXT, p.user_id, (p.first_name || ' ' || p.last_name), p.bio, ts_rank(p.search_vector, plainto_tsquery('english', search_query))
    FROM profiles p WHERE p.search_vector @@ plainto_tsquery('english', search_query)
    UNION ALL
    SELECT 'mentor'::TEXT, m.id, m.title, m.company, ts_rank(m.search_vector, plainto_tsquery('english', search_query))
    FROM mentors m WHERE m.search_vector @@ plainto_tsquery('english', search_query)
    UNION ALL
    SELECT 'resource'::TEXT, r.id, r.title, r.description, ts_rank(r.search_vector, plainto_tsquery('english', search_query))
    FROM resources r WHERE r.search_vector @@ plainto_tsquery('english', search_query) AND r.is_active = true
    UNION ALL
    SELECT 'service'::TEXT, s.id, s.name, s.short_description, ts_rank(s.search_vector, plainto_tsquery('english', search_query))
    FROM services s WHERE s.search_vector @@ plainto_tsquery('english', search_query) AND s.is_active = true
    UNION ALL
    SELECT 'funding'::TEXT, f.id, f.title, f.description, ts_rank(f.search_vector, plainto_tsquery('english', search_query))
    FROM funding_opportunities f WHERE f.search_vector @@ plainto_tsquery('english', search_query) AND f.status = 'active'
    UNION ALL
    SELECT 'startup'::TEXT, sp.id, sp.company_name, sp.description, ts_rank(sp.search_vector, plainto_tsquery('english', search_query))
    FROM startup_profiles sp WHERE sp.search_vector @@ plainto_tsquery('english', search_query)
  ) ORDER BY rank DESC LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;