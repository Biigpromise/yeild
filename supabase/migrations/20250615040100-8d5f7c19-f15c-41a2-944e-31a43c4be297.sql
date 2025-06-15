
-- Create messages table to store community chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX messages_user_id_idx ON public.messages(user_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all messages
CREATE POLICY "Allow authenticated users to read all messages" 
ON public.messages 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow users to insert their own messages
CREATE POLICY "Allow users to insert their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable realtime updates for the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
