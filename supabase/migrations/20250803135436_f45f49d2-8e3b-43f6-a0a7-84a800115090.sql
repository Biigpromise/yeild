-- Add parent_comment_id column to message_comments table to support nested comments
ALTER TABLE public.message_comments 
ADD COLUMN parent_comment_id uuid REFERENCES public.message_comments(id) ON DELETE CASCADE;

-- Add an index for better query performance
CREATE INDEX idx_message_comments_parent_id ON public.message_comments(parent_comment_id);

-- Add a trigger to update reply counts when nested comments are added/removed
CREATE OR REPLACE FUNCTION public.update_message_comment_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL) THEN
    UPDATE public.message_comments
    SET reply_count = COALESCE(reply_count, 0) + 1
    WHERE id = NEW.parent_comment_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL) THEN
    UPDATE public.message_comments
    SET reply_count = GREATEST(COALESCE(reply_count, 0) - 1, 0)
    WHERE id = OLD.parent_comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Add reply_count column to track number of replies
ALTER TABLE public.message_comments 
ADD COLUMN reply_count integer DEFAULT 0;

-- Create the trigger
CREATE TRIGGER trigger_update_message_comment_reply_count
  AFTER INSERT OR DELETE ON public.message_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_message_comment_reply_count();