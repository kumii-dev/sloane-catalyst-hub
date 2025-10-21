-- Create a SECURITY DEFINER function to recalculate a mentor's rating from session_reviews
CREATE OR REPLACE FUNCTION public.recalculate_mentor_rating(p_mentor_user_id uuid)
RETURNS TABLE(new_rating numeric, total_reviews integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_avg numeric;
BEGIN
  SELECT count(*), coalesce(avg(rating), 0) INTO v_count, v_avg
  FROM public.session_reviews
  WHERE reviewee_id = p_mentor_user_id;

  -- Only update if this user is actually a mentor
  IF EXISTS (SELECT 1 FROM public.mentors WHERE user_id = p_mentor_user_id) THEN
    UPDATE public.mentors
    SET rating = round(v_avg::numeric * 10)/10,
        total_reviews = v_count,
        updated_at = now()
    WHERE user_id = p_mentor_user_id;
  END IF;

  RETURN QUERY SELECT round(v_avg::numeric * 10)/10, v_count;
END;
$$;

-- Optional: allow authenticated users to call the function via RPC
GRANT EXECUTE ON FUNCTION public.recalculate_mentor_rating(uuid) TO authenticated;

-- Trigger function to automatically recalc rating on review changes
CREATE OR REPLACE FUNCTION public.handle_session_review_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate when the reviewee is a mentor
  IF EXISTS (SELECT 1 FROM public.mentors WHERE user_id = NEW.reviewee_id) THEN
    PERFORM public.recalculate_mentor_rating(NEW.reviewee_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on session_reviews for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_session_review_change ON public.session_reviews;
CREATE TRIGGER trg_session_review_change
AFTER INSERT OR UPDATE ON public.session_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_session_review_change();