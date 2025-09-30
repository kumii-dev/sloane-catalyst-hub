-- Create storage bucket for assessment documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-documents',
  'assessment-documents',
  false,
  10485760, -- 10MB limit per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- RLS policies for assessment documents
CREATE POLICY "Users can upload their own assessment documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assessment-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own assessment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assessment-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Funders can view shared assessment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assessment-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT ca.user_id::text
    FROM credit_assessments ca
    JOIN score_sharing ss ON ss.assessment_id = ca.id
    JOIN funders f ON f.id = ss.funder_id
    WHERE f.user_id = auth.uid()
      AND ca.consent_to_share = true
      AND ss.expires_at > now()
  )
);

-- Add new fields to credit_assessments table for the 10-domain scoring system
ALTER TABLE credit_assessments
ADD COLUMN business_profile_score integer,
ADD COLUMN repayment_behaviour_score integer,
ADD COLUMN operational_capacity_score integer,
ADD COLUMN technology_innovation_score integer,
ADD COLUMN social_environmental_score integer,
ADD COLUMN trust_reputation_score integer,
ADD COLUMN document_urls jsonb DEFAULT '{}'::jsonb,
ADD COLUMN ai_analysis jsonb,
ADD COLUMN risk_band text CHECK (risk_band IN ('Low', 'Medium', 'High')),
ADD COLUMN funding_eligibility_range text,
ADD COLUMN score_explanation text,
ADD COLUMN domain_explanations jsonb;

-- Update the overall_score calculation to be out of 1000
COMMENT ON COLUMN credit_assessments.overall_score IS 'Composite credit score on a 0-1000 scale';

-- Add index for faster queries
CREATE INDEX idx_credit_assessments_risk_band ON credit_assessments(risk_band);
CREATE INDEX idx_credit_assessments_overall_score ON credit_assessments(overall_score);