-- Update the messages insert policy to allow users to post without strict eligibility requirements
-- This will reduce friction while still maintaining security

DROP POLICY IF EXISTS "Allow eligible users to insert their own messages" ON public.messages;

CREATE POLICY "Users can insert their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);