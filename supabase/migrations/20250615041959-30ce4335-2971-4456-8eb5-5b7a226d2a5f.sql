
-- Create a table to store follower relationships
CREATE TABLE public.user_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_followers_unique_relation UNIQUE (follower_id, following_id)
);

-- Add indexes for efficient lookups
CREATE INDEX user_followers_follower_id_idx ON public.user_followers(follower_id);
CREATE INDEX user_followers_following_id_idx ON public.user_followers(following_id);

-- Add Row Level Security
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view follower relationships
CREATE POLICY "Allow authenticated users to view follower relationships"
  ON public.user_followers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to follow others (insert their own follower_id)
CREATE POLICY "Users can follow other users"
  ON public.user_followers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Allow users to unfollow others (delete their own follower_id)
CREATE POLICY "Users can unfollow other users"
  ON public.user_followers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Add follower and following counts to profiles table
ALTER TABLE public.profiles
ADD COLUMN followers_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN following_count INTEGER NOT NULL DEFAULT 0;

-- Create a function to update follower/following counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment follower count for the user being followed
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

    -- Increment following count for the user who is following
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement follower count for the user who was followed
    UPDATE public.profiles
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id AND followers_count > 0;

    -- Decrement following count for the user who was following
    UPDATE public.profiles
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id AND following_count > 0;
  END IF;

  RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$;

-- Create a trigger to update counts on follow/unfollow
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.user_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_counts();
