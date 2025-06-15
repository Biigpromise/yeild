
-- Replace the function with secure search_path set to public
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id_to_inc UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = post_id_to_inc;
$$;
