-- Insert 22 On Sloane as a service provider (OEM)
INSERT INTO service_providers (
  id,
  user_id,
  company_name,
  description,
  logo_url,
  website,
  contact_email,
  is_verified,
  is_cohort_partner,
  rating
) VALUES (
  'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  '00000000-0000-0000-0000-000000000000', -- placeholder user_id
  '22 On Sloane',
  'Leading provider of innovative business solutions for startups and SMEs',
  '/src/assets/22-on-sloane-logo.png',
  'https://www.22onsloane.com',
  'info@22onsloane.com',
  true,
  true,
  5.0
) ON CONFLICT (id) DO NOTHING;

-- Get the category ID for Startup Support & Advisory
DO $$
DECLARE
  category_uuid UUID;
BEGIN
  SELECT id INTO category_uuid 
  FROM service_categories 
  WHERE slug = 'sw-startup-support-advisory';

  -- Insert Credit Scoring Tool service
  INSERT INTO services (
    id,
    provider_id,
    category_id,
    name,
    short_description,
    description,
    key_features,
    target_industries,
    service_type,
    pricing_type,
    credits_price,
    base_price,
    is_active,
    is_featured,
    rating,
    total_reviews,
    total_subscribers,
    cohort_benefits
  ) VALUES (
    'f1e2d3c4-b5a6-4d7e-8f9a-0b1c2d3e4f5a',
    'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    category_uuid,
    'Credit Scoring Tool',
    'AI-powered credit assessment tool for startups and SMEs',
    'Our Credit Scoring Tool uses advanced AI algorithms to assess startup creditworthiness based on multiple factors including business profile, financial health, operational capacity, and growth readiness. Get instant credit scores and funding eligibility recommendations.',
    ARRAY[
      'AI-powered credit analysis',
      'Multi-dimensional scoring across 10+ criteria',
      'Instant funding eligibility assessment',
      'Risk band classification',
      'Detailed improvement recommendations',
      'Secure document upload and analysis',
      'Shareable credit reports for funders',
      'Regular score updates and monitoring'
    ],
    ARRAY[
      'Startups',
      'SMEs',
      'Technology',
      'Financial Services',
      'All Industries'
    ],
    'subscription',
    'credits_only',
    50,
    99.00,
    true,
    true,
    4.8,
    12,
    45,
    'Cohort members receive 50% discount on first assessment and priority support'
  ) ON CONFLICT (id) DO NOTHING;
END $$;