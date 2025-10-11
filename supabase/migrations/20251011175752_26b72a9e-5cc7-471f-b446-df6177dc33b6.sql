-- First, let's fix the credit_assessments policies that are causing recursion
-- Drop and recreate the problematic policies

DROP POLICY IF EXISTS "Users can view their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.credit_assessments;
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;

-- Recreate policies without recursion
CREATE POLICY "Users can view their own assessments"
ON public.credit_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.credit_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.credit_assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Fix the funder policy to avoid recursion by using a simpler check
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments FOR SELECT
USING (
  consent_to_share = true 
  AND EXISTS (
    SELECT 1 FROM score_sharing ss
    JOIN funders f ON f.id = ss.funder_id
    WHERE ss.assessment_id = credit_assessments.id
    AND f.user_id = auth.uid()
    AND ss.expires_at > now()
  )
);