-- Insert 5 additional Software Services categories
INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Legal, Risk & Governance', 
  'Manage contracts, governance, and compliance', 
  'sw-legal-risk-governance', 
  id, 
  11, 
  'Scale', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Industry-Specific Solutions', 
  'Specialized systems for sectors (expandable over time)', 
  'sw-industry-specific-solutions', 
  id, 
  12, 
  'Building', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Developer & Tech Tools', 
  'Tools for software developers or IT teams', 
  'sw-developer-tech-tools', 
  id, 
  13, 
  'Code', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Integration & Automation', 
  'Connect systems and automate workflows', 
  'sw-integration-automation', 
  id, 
  14, 
  'Zap', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, slug, parent_id, sort_order, icon, is_active)
SELECT 
  'Startup Support & Advisory', 
  'Platforms for growth and mentorship', 
  'sw-startup-support-advisory', 
  id, 
  15, 
  'Rocket', 
  true
FROM service_categories WHERE slug = 'software-services'
ON CONFLICT (slug) DO NOTHING;