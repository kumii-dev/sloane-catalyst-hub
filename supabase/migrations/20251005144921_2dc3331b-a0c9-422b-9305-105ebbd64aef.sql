-- Update existing subcategories and add new ones for Software Services
-- Update CRM & Sales -> Customer Relationship & Sales
UPDATE service_categories 
SET 
  name = 'Customer Relationship & Sales',
  description = 'Systems that drive customer engagement and revenue growth',
  slug = 'sw-customer-relationship-sales',
  sort_order = 2
WHERE id = 'c4008cd8-dd0b-4e1c-b152-2972372a4405';

-- Update Accounting & Finance
UPDATE service_categories 
SET 
  name = 'Accounting & Finance',
  description = 'Manage money, payments, and compliance',
  slug = 'sw-accounting-finance',
  sort_order = 3
WHERE id = '8ccd021f-d0a6-42a9-902b-27e9f7df807f';

-- Update HR & Productivity -> HR & People Development
UPDATE service_categories 
SET 
  name = 'HR & People Development',
  description = 'Build high-performing teams',
  slug = 'sw-hr-people-development',
  sort_order = 10
WHERE id = '9d8f91d1-e29e-4595-9723-b741c6f6002c';

-- Update Marketing, Branding & Analytics
UPDATE service_categories 
SET 
  name = 'Marketing, Branding & Analytics',
  description = 'Promote, analyze, and grow your brand',
  slug = 'sw-marketing-branding-analytics',
  sort_order = 4
WHERE id = 'a8dff58f-f110-42a9-9d9d-b3fabca499d1';

-- Update Security & Compliance -> Cybersecurity & Compliance
UPDATE service_categories 
SET 
  name = 'Cybersecurity & Compliance',
  description = 'Secure operations and ensure data privacy',
  slug = 'sw-cybersecurity-compliance',
  sort_order = 6
WHERE id = '86a27c62-23f0-41d7-b630-dc55c5c88261';

-- Insert new categories
INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Business Operations & Productivity', 
  'Tools to run daily operations efficiently', 
  'sw-business-operations-productivity', 
  id, 
  1, 
  'Briefcase', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'eCommerce & Retail', 
  'Build online stores or sell products', 
  'sw-ecommerce-retail', 
  id, 
  5, 
  'ShoppingCart', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Data, AI & Analytics', 
  'Extract insights and intelligence', 
  'sw-data-ai-analytics', 
  id, 
  7, 
  'Brain', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Cloud, Hosting & Infrastructure', 
  'Enable scalability and digital readiness', 
  'sw-cloud-hosting-infrastructure', 
  id, 
  8, 
  'Cloud', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Project Management & Collaboration', 
  'Manage projects, teams, and progress', 
  'sw-project-management-collaboration', 
  id, 
  9, 
  'FolderKanban', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;