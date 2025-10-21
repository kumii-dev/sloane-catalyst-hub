-- Add performance indexes for marketplace at scale

-- Listings table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_provider_created 
  ON listings(provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_status_created 
  ON listings(status, created_at DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_category_status 
  ON listings(category_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_featured 
  ON listings(is_featured, created_at DESC) WHERE is_featured = true AND status = 'active';

-- Full-text search on listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_listings_search 
  ON listings USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_listings_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
DROP TRIGGER IF EXISTS trigger_update_listings_search ON listings;
CREATE TRIGGER trigger_update_listings_search
  BEFORE INSERT OR UPDATE OF title, short_description, description, tags
  ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listings_search_vector();

-- Update existing records
UPDATE listings SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D');

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON user_subscriptions(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_listing 
  ON user_subscriptions(listing_id, status) WHERE status = 'active';

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listing 
  ON listing_reviews(listing_id, created_at DESC);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_featured_active 
  ON services(is_featured, is_active, created_at DESC) 
  WHERE is_featured = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_category_active 
  ON services(category_id, is_active) WHERE is_active = true;

-- Cohort funded listings index
CREATE INDEX IF NOT EXISTS idx_cohort_funded_active 
  ON cohort_funded_listings(cohort_id, listing_id, is_active) 
  WHERE is_active = true;