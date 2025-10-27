-- Delete pending service provider applications and roles for current user
-- This allows users to reapply if needed

-- Delete from service_providers
DELETE FROM service_providers 
WHERE user_id = auth.uid() 
AND vetting_status = 'pending';

-- Delete pending provider role
DELETE FROM user_roles 
WHERE user_id = auth.uid() 
AND role = 'software_provider_pending';