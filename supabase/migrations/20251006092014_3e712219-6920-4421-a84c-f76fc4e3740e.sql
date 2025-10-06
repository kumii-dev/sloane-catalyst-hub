-- Insert all software service subcategories
INSERT INTO service_categories (name, slug, description, icon, parent_id, sort_order, is_active)
SELECT 
  name,
  slug,
  description,
  icon,
  (SELECT id FROM service_categories WHERE slug = 'software-services'),
  sort_order,
  true
FROM (VALUES
  ('Marketing, Branding & Analytics', 'sw-marketing-branding-analytics', 'Campaign management, brand monitoring, and performance analytics', 'BarChart3', 4),
  ('eCommerce & Retail', 'sw-ecommerce-retail', 'Online stores, inventory, and retail management systems', 'ShoppingCart', 5),
  ('Cybersecurity & Compliance', 'sw-cybersecurity-compliance', 'Security tools, threat detection, and compliance management', 'Shield', 6),
  ('Data, AI & Analytics', 'sw-data-ai-analytics', 'Business intelligence, machine learning, and data platforms', 'Brain', 7),
  ('Cloud, Hosting & Infrastructure', 'sw-cloud-hosting-infrastructure', 'Cloud services, hosting, and infrastructure management', 'Cloud', 8),
  ('Project Management & Collaboration', 'sw-project-management-collaboration', 'Project tracking, team collaboration, and workflow tools', 'FolderKanban', 9),
  ('HR & People Development', 'sw-hr-people-development', 'Human resources, payroll, and talent management systems', 'Award', 10),
  ('Legal, Risk & Governance', 'sw-legal-risk-governance', 'Legal management, compliance, and governance tools', 'Scale', 11),
  ('Industry-Specific Solutions', 'sw-industry-specific-solutions', 'Specialized software for healthcare, construction, and more', 'Building', 12),
  ('Developer & Tech Tools', 'sw-developer-tech-tools', 'Development environments, version control, and testing tools', 'Code', 13),
  ('Integration & Automation', 'sw-integration-automation', 'Workflow automation and system integration platforms', 'Zap', 14),
  ('Startup Support & Advisory', 'sw-startup-support-advisory', 'Tools and services to help startups launch and scale', 'Rocket', 15)
) AS new_cats(name, slug, description, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM service_categories WHERE service_categories.slug = new_cats.slug
);