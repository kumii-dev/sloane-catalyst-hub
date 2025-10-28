-- Add contact_person column to service_providers table
ALTER TABLE public.service_providers 
ADD COLUMN contact_person TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.service_providers.contact_person IS 'Full name of the primary contact person for the service provider';