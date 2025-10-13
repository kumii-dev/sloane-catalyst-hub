-- Add foreign key from conversation_messages.sender_id to auth.users
-- Note: We don't add FK to auth.users directly, but document the relationship

-- Add foreign key from conversation_participants.user_id to auth.users (already implicit)
-- These relationships exist but aren't explicitly foreign keys to auth schema

-- Set search_path for the trigger function to avoid security issues
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  
  -- Update unread count for all participants except sender
  UPDATE public.conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$;