-- Create a security-definer function to fetch the other participant's profile for a conversation
-- This allows a conversation participant to see the other participant's basic profile under RLS
CREATE OR REPLACE FUNCTION public.get_other_participant_profiles(
  p_conversation_id uuid
)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  profile_picture_url text,
  persona_type public.persona_type,
  organization text,
  bio text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id,
         p.first_name,
         p.last_name,
         p.profile_picture_url,
         p.persona_type,
         p.organization,
         p.bio
  FROM public.conversation_participants cp
  JOIN public.profiles p ON p.user_id = cp.user_id
  WHERE cp.conversation_id = p_conversation_id
    AND cp.user_id <> auth.uid()
    AND is_conversation_participant(p_conversation_id, auth.uid());
$$;

-- Ensure only authenticated users can execute the function implicitly via RLS checks inside
REVOKE ALL ON FUNCTION public.get_other_participant_profiles(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_other_participant_profiles(uuid) TO authenticated;
