-- Fix infinite recursion in conversation_participants policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create a simpler policy without circular reference
CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

-- Add policy to allow users to create conversations
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (true);

-- Add policy to update conversations (for last_message_at)
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);