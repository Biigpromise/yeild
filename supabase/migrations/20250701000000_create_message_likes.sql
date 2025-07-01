
-- Create message_likes table to track likes on messages
CREATE TABLE IF NOT EXISTS public.message_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Ensure a user can only like a message once
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all message likes" ON public.message_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.message_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.message_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_message_likes_message_id ON public.message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user_id ON public.message_likes(user_id);
