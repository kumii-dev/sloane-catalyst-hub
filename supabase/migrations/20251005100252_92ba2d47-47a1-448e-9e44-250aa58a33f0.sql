-- Create enum types for the marketplace
CREATE TYPE listing_type AS ENUM ('software', 'ancillary', 'mentorship', 'funding', 'training', 'event', 'other');
CREATE TYPE delivery_mode AS ENUM ('hybrid', 'online', 'in_person');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_approval', 'active', 'paused', 'rejected');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE payment_method AS ENUM ('paystack', 'credits', 'sponsored');
CREATE TYPE app_role AS ENUM ('admin', 'startup', 'smme', 'mentor', 'advisor', 'funder', 'service_provider');

-- User roles table (security definer pattern)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohorts table
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sponsor_name text NOT NULL, -- e.g., "Microsoft", "AWS", "African Bank"
  sponsor_logo_url text,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  credits_allocated integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohorts viewable by everyone"
  ON public.cohorts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cohorts"
  ON public.cohorts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohort memberships
CREATE TABLE public.cohort_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(cohort_id, user_id)
);

ALTER TABLE public.cohort_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cohort memberships"
  ON public.cohort_memberships FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage cohort memberships"
  ON public.cohort_memberships FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Listing categories (expand existing service_categories)
CREATE TABLE IF NOT EXISTS public.listing_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES public.listing_categories(id),
  icon text,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON public.listing_categories FOR SELECT
  USING (is_active = true);

-- Listings table (comprehensive marketplace listings)
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_type listing_type NOT NULL,
  category_id uuid REFERENCES public.listing_categories(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  description text NOT NULL,
  delivery_mode delivery_mode NOT NULL DEFAULT 'online',
  
  -- Pricing
  base_price numeric(10,2),
  credits_price integer, -- Cost in Sloane Credits
  is_subscription boolean DEFAULT false,
  subscription_duration_days integer,
  
  -- Availability
  capacity integer,
  available_slots jsonb, -- For booking-based services
  
  -- Media
  thumbnail_url text,
  gallery_images text[],
  attachments jsonb, -- {filename, url, type}
  
  -- Visibility & Access
  status listing_status DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  visible_to_all boolean DEFAULT true,
  cohort_visibility uuid[], -- Array of cohort IDs
  
  -- Metadata
  tags text[],
  rating numeric(2,1) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_subscriptions integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings viewable by everyone"
  ON public.listings FOR SELECT
  USING (status = 'active' AND (visible_to_all = true OR auth.uid() = provider_id));

CREATE POLICY "Users can create their listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Cohort funded listings (which listings are sponsored for which cohorts)
CREATE TABLE public.cohort_funded_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cohort_id, listing_id)
);

ALTER TABLE public.cohort_funded_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohort funded listings viewable by members"
  ON public.cohort_funded_listings FOR SELECT
  USING (
    is_active = true AND (
      public.has_role(auth.uid(), 'admin') OR
      EXISTS (
        SELECT 1 FROM public.cohort_memberships cm
        WHERE cm.cohort_id = cohort_funded_listings.cohort_id
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
      )
    )
  );

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  status subscription_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  
  -- Payment details
  amount_paid numeric(10,2),
  credits_used integer,
  cohort_id uuid REFERENCES public.cohorts(id), -- If sponsored
  
  -- Subscription period
  started_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean DEFAULT false,
  
  -- Transaction reference
  paystack_reference text,
  transaction_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view their listing subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = user_subscriptions.listing_id
      AND l.provider_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Credits wallet
CREATE TABLE public.credits_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance integer DEFAULT 0 CHECK (balance >= 0),
  total_earned integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.credits_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their wallet"
  ON public.credits_wallet FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage wallets"
  ON public.credits_wallet FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Credits transactions
CREATE TABLE public.credits_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL, -- Positive for credit, negative for debit
  transaction_type text NOT NULL, -- 'subscription', 'topup', 'cohort_allocation', 'refund'
  reference_id uuid, -- Reference to subscription or other entity
  description text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions"
  ON public.credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Listing reviews
CREATE TABLE public.listing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
  ON public.listing_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.listing_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews"
  ON public.listing_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_categories_updated_at
  BEFORE UPDATE ON public.listing_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_wallet_updated_at
  BEFORE UPDATE ON public.credits_wallet
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_reviews_updated_at
  BEFORE UPDATE ON public.listing_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_listings_provider ON public.listings(provider_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_type ON public.listings(listing_type);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_listing ON public.user_subscriptions(listing_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_cohort_memberships_user ON public.cohort_memberships(user_id);
CREATE INDEX idx_cohort_memberships_cohort ON public.cohort_memberships(cohort_id);
CREATE INDEX idx_credits_transactions_user ON public.credits_transactions(user_id);