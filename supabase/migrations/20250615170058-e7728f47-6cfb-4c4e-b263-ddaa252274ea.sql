
-- Add view_count and likes_count to posts table
ALTER TABLE public.posts
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- Create table for post likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT post_likes_unique_user_post UNIQUE (post_id, user_id)
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for post_likes
CREATE POLICY "Users can view all likes" ON public.post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes" ON public.post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update likes_count on posts table
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function
CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Create a function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_view(post_id_to_inc UUID)
RETURNS VOID AS $$
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = post_id_to_inc;
$$ LANGUAGE sql;

-- Add post_likes to the publication for realtime
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

