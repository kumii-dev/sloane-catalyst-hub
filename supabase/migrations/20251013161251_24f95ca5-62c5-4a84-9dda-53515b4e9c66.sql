-- Create session_reviews table for mutual reviews
CREATE TABLE public.session_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.mentoring_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id, reviewee_id)
);

-- Enable RLS
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reviews where they are involved"
ON public.session_reviews
FOR SELECT
USING (
  auth.uid() = reviewer_id OR 
  auth.uid() = reviewee_id OR
  reviewee_id IN (
    SELECT user_id FROM public.mentors WHERE id IN (
      SELECT mentor_id FROM public.mentoring_sessions WHERE id = session_id
    )
  )
);

CREATE POLICY "Users can create reviews for their sessions"
ON public.session_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.mentoring_sessions ms
    WHERE ms.id = session_id
    AND ms.session_status = 'completed'
    AND (
      ms.mentee_id = auth.uid() OR
      ms.mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.session_reviews
FOR UPDATE
USING (auth.uid() = reviewer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_session_reviews_updated_at
BEFORE UPDATE ON public.session_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();