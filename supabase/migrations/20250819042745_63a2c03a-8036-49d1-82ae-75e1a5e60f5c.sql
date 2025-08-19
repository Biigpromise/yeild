-- Allow current user to post in chat for testing
UPDATE profiles 
SET can_post_in_chat = true 
WHERE id = auth.uid();

-- Create or update RLS policy for messages to allow community posts
DROP POLICY IF EXISTS "Users can insert community messages" ON messages;
CREATE POLICY "Users can insert community messages" 
ON messages 
FOR INSERT 
WITH CHECK (
  (chat_id IS NULL AND message_context = 'community')
  OR 
  (chat_id IS NOT NULL AND is_chat_participant(chat_id, auth.uid()))
);

-- Create policy for reading community messages
DROP POLICY IF EXISTS "Users can view community messages" ON messages;
CREATE POLICY "Users can view community messages" 
ON messages 
FOR SELECT 
USING (
  (chat_id IS NULL AND message_context = 'community')
  OR 
  (chat_id IS NOT NULL AND is_chat_participant(chat_id, auth.uid()))
);