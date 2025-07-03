-- Create message_likes table for community chat
CREATE TABLE IF NOT EXISTS public.message_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own likes" ON public.message_likes
  FOR INSERT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.message_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON public.message_likes
  FOR SELECT USING (true);

-- Add index for performance
CREATE INDEX idx_message_likes_message_id ON public.message_likes(message_id);
CREATE INDEX idx_message_likes_user_id ON public.message_likes(user_id);