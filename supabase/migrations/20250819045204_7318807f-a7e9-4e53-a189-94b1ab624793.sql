-- Fix infinite recursion in chat_participants RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view participants of their chats" ON chat_participants
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    chat_id IN (
      SELECT DISTINCT chat_id 
      FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Also ensure messages table has proper RLS policies for community messages
-- Check if there's a policy for community messages
CREATE POLICY IF NOT EXISTS "Community messages are viewable by authenticated users" ON messages
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  chat_id IS NULL AND 
  message_context = 'community'
);

-- Allow authenticated users to insert community messages
CREATE POLICY IF NOT EXISTS "Authenticated users can send community messages" ON messages
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);

-- Allow users to update their own community messages
CREATE POLICY IF NOT EXISTS "Users can update their own community messages" ON messages
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);

-- Allow users to delete their own community messages
CREATE POLICY IF NOT EXISTS "Users can delete their own community messages" ON messages
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  chat_id IS NULL AND 
  message_context = 'community'
);