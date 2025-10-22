-- Add software_provider role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
  
  -- Add software_provider to existing enum
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'software_provider';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'software_provider_pending';
END $$;

-- Add vetting fields to service_providers table
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS vetting_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS vetting_notes text,
ADD COLUMN IF NOT EXISTS business_registration_number text,
ADD COLUMN IF NOT EXISTS proof_document_url text,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);

-- Create index for faster vetting queries
CREATE INDEX IF NOT EXISTS idx_service_providers_vetting_status ON service_providers(vetting_status);

-- Update RLS policies for service_providers
DROP POLICY IF EXISTS "Providers can manage their services" ON services;
CREATE POLICY "Approved providers can manage their services"
ON services
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM service_providers 
    WHERE id = services.provider_id 
    AND vetting_status = 'approved'
  )
);

-- Allow users to view their provider application status
DROP POLICY IF EXISTS "Users can update their own provider profile" ON service_providers;
CREATE POLICY "Users can view and update their own provider profile"
ON service_providers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin policy for managing provider applications
CREATE POLICY "Admins can manage all provider applications"
ON service_providers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update user role when provider is approved
CREATE OR REPLACE FUNCTION approve_service_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vetting_status = 'approved' AND OLD.vetting_status != 'approved' THEN
    -- Add software_provider role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'software_provider'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove pending role if exists
    DELETE FROM user_roles 
    WHERE user_id = NEW.user_id AND role = 'software_provider_pending'::app_role;
    
    NEW.approved_at = now();
  ELSIF NEW.vetting_status = 'rejected' AND OLD.vetting_status != 'rejected' THEN
    NEW.rejected_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;