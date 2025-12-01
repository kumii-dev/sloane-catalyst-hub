-- Insert missing migration records into supabase_migrations.schema_migrations
-- These migrations were applied manually but not tracked

-- Part 1 migrations (9 migrations)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES 
  ('20251027115220', '43682323-73b4-42c7-b543-14417ffeeb99', ARRAY['-- Migration statements applied']),
  ('20251027120117', '27dac0c6-4c33-4024-96ec-3ea6c45fcfc4', ARRAY['-- Migration statements applied']),
  ('20251027140404', '33e99b66-d53b-42c9-bccd-f72d1ddb6c9e', ARRAY['-- Migration statements applied']),
  ('20251027151629', 'f25e7f41-3df8-4d2f-93ca-ad0332fcd8bb', ARRAY['-- Migration statements applied']),
  ('20251027160946', '1e64ca64-42e0-4734-bd37-eee4d7cc2942', ARRAY['-- Migration statements applied']),
  ('20251027172849', 'a5ad5fc5-eca1-4ae6-a9fa-a2e17cb72d53', ARRAY['-- Migration statements applied']),
  ('20251028070651', 'e0e939f5-b4f5-45ff-9d91-0116c4cf7e21', ARRAY['-- Migration statements applied']),
  ('20251028084459', '7f51fbb6-92e3-4e6a-9f93-b1add1e1de97', ARRAY['-- Migration statements applied']),
  ('20251028090849', '5c3e1148-6ff3-49e5-b56f-ee28dd5cd86f', ARRAY['-- Migration statements applied'])
ON CONFLICT (version) DO NOTHING;

-- Part 2 migrations (10 migrations)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES 
  ('20251028132603', 'd895002a-9e16-4aba-88c5-a5cb1b8b4af4', ARRAY['-- Migration statements applied']),
  ('20251028162739', 'cde858ea-da01-4b3d-8e9d-7c7de3b18ccc', ARRAY['-- Migration statements applied']),
  ('20251029175709', 'ce43769a-8e46-48a9-b0d6-e2e78b76ca22', ARRAY['-- Migration statements applied']),
  ('20251029234645', '20f02ece-995c-4a1a-b9dc-9eebb3f86eb0', ARRAY['-- Migration statements applied']),
  ('20251030001151', 'b58e531b-f12d-4aa7-9402-e43812e24ef2', ARRAY['-- Migration statements applied']),
  ('20251103164604', '32d3b3aa-bd9c-4077-875e-115150ebb5d0', ARRAY['-- Migration statements applied']),
  ('20251104231049', '169d536d-2147-4ef4-936c-ab8645bf9dc7', ARRAY['-- Migration statements applied']),
  ('20251121081115', '767716ea-d55c-4fa7-b816-c1ead480418f', ARRAY['-- Migration statements applied']),
  ('20251125083211', 'abf884cc-c864-4f18-94d7-b86d9ddbf12d', ARRAY['-- Migration statements applied']),
  ('20251125111816', 'ce1689ac-ecf8-4df7-9a41-121b50fc4c15', ARRAY['-- Migration statements applied'])
ON CONFLICT (version) DO NOTHING;

-- Verify the new count
SELECT COUNT(*) as total_migrations 
FROM supabase_migrations.schema_migrations;

-- Check the last 5 migrations
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 5;
