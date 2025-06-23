
-- Create post_reactions table for like/dislike functionality
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT post_reactions_unique_user_post UNIQUE (post_id, user_id)
);

-- Enable RLS for post_reactions
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for post_reactions
CREATE POLICY "Users can view all reactions" ON public.post_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.post_reactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.post_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add media_url column to posts table if it doesn't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url TEXT;
