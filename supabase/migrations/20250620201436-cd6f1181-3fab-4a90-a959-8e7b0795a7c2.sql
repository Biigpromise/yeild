
-- Add view tracking for stories
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT story_views_unique_user_story UNIQUE (story_id, user_id)
);

-- Enable RLS for story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Policies for story_views
CREATE POLICY "Users can view all story views" ON public.story_views
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own story views" ON public.story_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add view_count to stories table
ALTER TABLE public.stories
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update story view count
CREATE OR REPLACE FUNCTION update_story_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories
    SET view_count = view_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.stories
    SET view_count = view_count - 1
    WHERE id = OLD.story_id AND view_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for story view count
CREATE TRIGGER on_story_view_change
AFTER INSERT OR DELETE ON public.story_views
FOR EACH ROW EXECUTE FUNCTION update_story_view_count();

-- Create table for post replies
CREATE TABLE public.post_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for post_replies
ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;

-- Policies for post_replies
CREATE POLICY "Anyone can read replies (public feed)" ON public.post_replies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own replies" ON public.post_replies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON public.post_replies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" ON public.post_replies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add reply count to posts table
ALTER TABLE public.posts
ADD COLUMN reply_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update post reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET reply_count = reply_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET reply_count = reply_count - 1
    WHERE id = OLD.post_id AND reply_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for post reply count
CREATE TRIGGER on_post_reply_change
AFTER INSERT OR DELETE ON public.post_replies
FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Create table to track unique post views (one per user)
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT post_views_unique_user_post UNIQUE (post_id, user_id)
);

-- Enable RLS for post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Policies for post_views
CREATE POLICY "Users can view all post views" ON public.post_views
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own post views" ON public.post_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update the increment_post_view function to use unique tracking
CREATE OR REPLACE FUNCTION increment_post_view(post_id_to_inc UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Try to insert a new view record (will fail if already exists due to unique constraint)
  INSERT INTO public.post_views (post_id, user_id)
  VALUES (post_id_to_inc, user_id_param)
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  -- Update the post view count based on actual unique views
  UPDATE public.posts
  SET view_count = (
    SELECT COUNT(*)
    FROM public.post_views
    WHERE post_id = post_id_to_inc
  )
  WHERE id = post_id_to_inc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add realtime support for new tables
ALTER TABLE public.story_views REPLICA IDENTITY FULL;
ALTER TABLE public.post_replies REPLICA IDENTITY FULL;
ALTER TABLE public.post_views REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.story_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_views;
