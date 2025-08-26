-- Fix the trigger issue that's causing "control reached end of trigger procedure without RETURN"
-- Check for triggers on brand_campaigns table and fix them

-- Drop and recreate the problematic trigger
DROP TRIGGER IF EXISTS notify_admin_new_campaign_trigger ON brand_campaigns;

-- Recreate the trigger function with proper return
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

-- Recreate the trigger
CREATE TRIGGER notify_admin_new_campaign_trigger
    AFTER INSERT ON brand_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_new_campaign();