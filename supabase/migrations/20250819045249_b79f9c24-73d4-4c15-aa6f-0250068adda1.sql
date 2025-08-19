-- Fix infinite recursion in chat_participants RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;

-- Create a simpler, non-recursive policy for chat_participants
CREATE POLICY "Users can view participants of their chats" ON chat_participants
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Drop existing message policies that might conflict
DROP POLICY IF EXISTS "Community messages are viewable by authenticated users" ON messages;
DROP POLICY IF EXISTS "Authenticated users can send community messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own community messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own community messages" ON messages;

-- Create new RLS policies for community messages
CREATE POLICY "Community messages are viewable by authenticated users" ON messages
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  chat_id IS NULL AND 
  message_context = 'community'
);

CREATE POLICY "Authenticated users can send community messages" ON messages
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);

CREATE POLICY "Users can update their own community messages" ON messages
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);

CREATE POLICY "Users can delete their own community messages" ON messages
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);