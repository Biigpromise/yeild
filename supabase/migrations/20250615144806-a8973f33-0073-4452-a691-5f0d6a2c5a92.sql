
-- Recreate the `update_follow_counts` function with a secure search_path
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
