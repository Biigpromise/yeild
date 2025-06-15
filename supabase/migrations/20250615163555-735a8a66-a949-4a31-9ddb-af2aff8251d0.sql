
-- Create a new `posts` table for individual user posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own posts
CREATE POLICY "Users can select their own posts" ON public.posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- (Optional for feed: allow all users to view all posts, remove this if "friends only" is desired)
CREATE POLICY "Anyone can read posts (public feed)" ON public.posts
  FOR SELECT
  USING (true);
