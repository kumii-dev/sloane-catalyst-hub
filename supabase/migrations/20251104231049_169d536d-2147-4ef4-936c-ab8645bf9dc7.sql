-- Create saved searches table for funders
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id UUID NOT NULL REFERENCES public.funders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_saved_searches_funder_id ON public.saved_searches(funder_id);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_searches
CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches
  FOR SELECT
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches
  FOR INSERT
  WITH CHECK (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches
  FOR UPDATE
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches
  FOR DELETE
  USING (
    funder_id IN (
      SELECT id FROM public.funders WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();