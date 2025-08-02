-- Just fix the initialize_user_tour function to handle errors gracefully
CREATE OR REPLACE FUNCTION public.initialize_user_tour()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_tours (user_id, tour_completed, tour_step)
  VALUES (NEW.id, FALSE, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in initialize_user_tour: %', SQLERRM;
    RETURN NEW;
END;
$function$;