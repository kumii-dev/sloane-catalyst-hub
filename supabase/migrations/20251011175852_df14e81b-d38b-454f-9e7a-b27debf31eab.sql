-- The error indicates infinite recursion in credit_assessments policies
-- Let's check and fix those policies

-- Drop the problematic credit_assessments policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON credit_assessments;
DROP POLICY IF EXISTS "Funders can view shared assessments" ON credit_assessments;

-- Recreate them with simplified logic to avoid recursion
CREATE POLICY "Users can view their own assessments"
ON credit_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON credit_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON credit_assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Funders can view shared assessments"
ON credit_assessments FOR SELECT
USING (
  consent_to_share = true 
  AND expires_at > now()
  AND EXISTS (
    SELECT 1 FROM score_sharing ss
    JOIN funders f ON f.id = ss.funder_id
    WHERE ss.assessment_id = credit_assessments.id
    AND f.user_id = auth.uid()
  )
);