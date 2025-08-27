-- Simple fix for the trigger error without deadlock
-- Just ensure the function returns properly
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  brand_name TEXT;
BEGIN
  -- Get brand name
  SELECT COALESCE(bp.company_name, p.name, p.email)
  INTO brand_name
  FROM public.profiles p
  LEFT JOIN public.brand_profiles bp ON bp.user_id = p.id
  WHERE p.id = NEW.brand_id;

  -- Create admin notification
  INSERT INTO public.admin_notifications (type, message, link_to)
  VALUES (
    'new_campaign',
    'New campaign "' || NEW.title || '" created by ' || COALESCE(brand_name, 'Unknown Brand') || ' with budget ₦' || NEW.budget::text,
    '/admin?section=campaigns&campaign=' || NEW.id
  );

  RETURN NEW;
END;
$function$;