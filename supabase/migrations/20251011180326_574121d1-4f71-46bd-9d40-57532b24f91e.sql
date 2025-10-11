-- 1) Create SECURITY DEFINER helper functions to avoid recursive RLS
create or replace function public.is_assessment_owner(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.credit_assessments ca
    where ca.id = _assessment_id
      and ca.user_id = _user_id
  );
$$;

create or replace function public.has_funder_assessment_access(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.score_sharing ss
    join public.funders f on f.id = ss.funder_id
    where ss.assessment_id = _assessment_id
      and f.user_id = _user_id
      and ss.expires_at > now()
  );
$$;

-- 2) Replace recursive policies with function-based checks
-- score_sharing
DROP POLICY IF EXISTS "Users can view their shared scores" ON public.score_sharing;
CREATE POLICY "Users can view their shared scores"
ON public.score_sharing
FOR SELECT
USING (public.is_assessment_owner(assessment_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create score shares" ON public.score_sharing;
CREATE POLICY "Users can create score shares"
ON public.score_sharing
FOR INSERT
WITH CHECK (public.is_assessment_owner(assessment_id, auth.uid()));

-- credit_assessments (funders view shared)
DROP POLICY IF EXISTS "Funders can view shared assessments" ON public.credit_assessments;
CREATE POLICY "Funders can view shared assessments"
ON public.credit_assessments
FOR SELECT
USING (
  consent_to_share = true
  AND public.has_funder_assessment_access(id, auth.uid())
);
