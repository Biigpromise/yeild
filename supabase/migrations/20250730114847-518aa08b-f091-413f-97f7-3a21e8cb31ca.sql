-- Fix security issues by updating function search paths
CREATE OR REPLACE FUNCTION public.update_announcement_interest_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.brand_task_announcements
    SET interest_count = interest_count + 1
    WHERE id = NEW.announcement_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.brand_task_announcements
    SET interest_count = GREATEST(0, interest_count - 1)
    WHERE id = OLD.announcement_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;