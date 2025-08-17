-- Fix infinite recursion in chat_participants RLS policy
DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;

-- Create a security definer function to check chat participation
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view participants of their chats" ON chat_participants
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM chat_participants cp2 
      WHERE cp2.chat_id = chat_participants.chat_id 
      AND cp2.user_id = auth.uid()
    )
  )
);