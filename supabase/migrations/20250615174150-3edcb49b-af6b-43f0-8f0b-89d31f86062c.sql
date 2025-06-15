
-- 1. Drop the trigger that uses update_post_likes_count
DROP TRIGGER IF EXISTS on_post_like_change ON public.post_likes;

-- 2. Drop the old function
DROP FUNCTION IF EXISTS public.update_post_likes_count();

-- 3. Create the correct version with fixed search_path
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
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
$$;

-- 4. Recreate the trigger with the new function
CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();
