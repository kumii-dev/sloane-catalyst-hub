-- Create comprehensive software categories for the marketplace

-- Insert main categories (15 top-level categories)
INSERT INTO service_categories (name, description, icon, slug, sort_order, is_active) VALUES
('Business Operations & Productivity', 'Tools to run daily operations efficiently', '💼', 'business-operations', 1, true),
('Customer Relationship & Sales', 'Systems that drive customer engagement and revenue growth', '🤝', 'customer-sales', 2, true),
('Accounting & Finance', 'Manage money, payments, and compliance', '💰', 'accounting-finance', 3, true),
('Marketing, Branding & Analytics', 'Promote, analyze, and grow your brand', '📊', 'marketing-analytics', 4, true),
('eCommerce & Retail', 'Build online stores or sell products', '🛒', 'ecommerce-retail', 5, true),
('Cybersecurity & Compliance', 'Secure operations and ensure data privacy', '🔒', 'cybersecurity-compliance', 6, true),
('Data, AI & Analytics', 'Extract insights and intelligence', '🤖', 'data-ai-analytics', 7, true),
('Cloud, Hosting & Infrastructure', 'Enable scalability and digital readiness', '☁️', 'cloud-infrastructure', 8, true),
('Project Management & Collaboration', 'Manage projects, teams, and progress', '📋', 'project-management', 9, true),
('HR & People Development', 'Build high-performing teams', '👥', 'hr-people', 10, true),
('Legal, Risk & Governance', 'Manage contracts, governance, and compliance', '⚖️', 'legal-governance', 11, true),
('Industry-Specific Solutions', 'Specialized systems for sectors', '🏭', 'industry-specific', 12, true),
('Developer & Tech Tools', 'Tools for software developers or IT teams', '💻', 'developer-tools', 13, true),
('Integration & Automation', 'Connect systems and automate workflows', '🔄', 'integration-automation', 14, true),
('Startup Support & Advisory', 'Platforms for growth and mentorship', '🚀', 'startup-support', 15, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Insert subcategories for Business Operations & Productivity
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'HR & Payroll', 'Human resources and payroll management', '👔', 'hr-payroll', id, 1, true
FROM service_categories WHERE slug = 'business-operations'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Task Management', 'Organize and track tasks', '✅', 'task-management', id, 2, true
FROM service_categories WHERE slug = 'business-operations'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Document Management', 'Store and manage documents', '📄', 'document-management', id, 3, true
FROM service_categories WHERE slug = 'business-operations'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Workflow Automation', 'Automate business processes', '⚡', 'workflow-automation', id, 4, true
FROM service_categories WHERE slug = 'business-operations'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Customer Relationship & Sales
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'CRM Systems', 'Customer relationship management platforms', '👥', 'crm-systems', id, 1, true
FROM service_categories WHERE slug = 'customer-sales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Sales Pipeline Tools', 'Manage sales opportunities', '📈', 'sales-pipeline', id, 2, true
FROM service_categories WHERE slug = 'customer-sales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Email Marketing', 'Email campaign management', '📧', 'email-marketing', id, 3, true
FROM service_categories WHERE slug = 'customer-sales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Customer Support & Helpdesk', 'Support ticket systems', '🎧', 'customer-support', id, 4, true
FROM service_categories WHERE slug = 'customer-sales'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Accounting & Finance
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Accounting Software', 'Full accounting solutions', '📚', 'accounting-software', id, 1, true
FROM service_categories WHERE slug = 'accounting-finance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Invoicing', 'Create and manage invoices', '🧾', 'invoicing', id, 2, true
FROM service_categories WHERE slug = 'accounting-finance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Expense Tracking', 'Track business expenses', '💳', 'expense-tracking', id, 3, true
FROM service_categories WHERE slug = 'accounting-finance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'POS Systems', 'Point of sale solutions', '🏪', 'pos-systems', id, 4, true
FROM service_categories WHERE slug = 'accounting-finance'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Marketing, Branding & Analytics
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Social Media Management', 'Manage social media presence', '📱', 'social-media', id, 1, true
FROM service_categories WHERE slug = 'marketing-analytics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'SEO Tools', 'Search engine optimization', '🔍', 'seo-tools', id, 2, true
FROM service_categories WHERE slug = 'marketing-analytics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Analytics Dashboards', 'Business intelligence and reporting', '📊', 'analytics-dashboards', id, 3, true
FROM service_categories WHERE slug = 'marketing-analytics'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for eCommerce & Retail
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Online Store Builders', 'Create online stores', '🏬', 'online-stores', id, 1, true
FROM service_categories WHERE slug = 'ecommerce-retail'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Inventory Management', 'Track inventory and stock', '📦', 'inventory-management', id, 2, true
FROM service_categories WHERE slug = 'ecommerce-retail'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'Payment Integrations', 'Payment processing solutions', '💸', 'payment-integrations', id, 3, true
FROM service_categories WHERE slug = 'ecommerce-retail'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Industry-Specific Solutions
INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'EdTech', 'Education technology solutions', '🎓', 'edtech', id, 1, true
FROM service_categories WHERE slug = 'industry-specific'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'FinTech', 'Financial technology platforms', '💎', 'fintech', id, 2, true
FROM service_categories WHERE slug = 'industry-specific'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'HealthTech', 'Healthcare technology solutions', '🏥', 'healthtech', id, 3, true
FROM service_categories WHERE slug = 'industry-specific'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (name, description, icon, slug, parent_id, sort_order, is_active)
SELECT 'AgriTech', 'Agricultural technology solutions', '🌾', 'agritech', id, 4, true
FROM service_categories WHERE slug = 'industry-specific'
ON CONFLICT (slug) DO NOTHING;