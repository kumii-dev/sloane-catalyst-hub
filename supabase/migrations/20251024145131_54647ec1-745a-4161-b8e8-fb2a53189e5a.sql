-- Create model_states table for financial model persistence
CREATE TABLE IF NOT EXISTS public.model_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  model_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_states ENABLE ROW LEVEL SECURITY;

-- Users can view their own models
CREATE POLICY "Users can view their own models"
ON public.model_states
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own models
CREATE POLICY "Users can create their own models"
ON public.model_states
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own models
CREATE POLICY "Users can update their own models"
ON public.model_states
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own models
CREATE POLICY "Users can delete their own models"
ON public.model_states
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_model_states_user_id ON public.model_states(user_id);
CREATE INDEX IF NOT EXISTS idx_model_states_updated_at ON public.model_states(updated_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_model_states_updated_at
BEFORE UPDATE ON public.model_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();