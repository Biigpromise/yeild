-- Fix the trigger that's causing the campaign update error
-- First, let's see what triggers exist on brand_campaigns table

-- Check if there are any triggers that don't return properly
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname, tgrelid::regclass as table_name
        FROM pg_trigger 
        WHERE tgrelid = 'public.brand_campaigns'::regclass
    LOOP
        RAISE NOTICE 'Found trigger: % on table %', trigger_rec.tgname, trigger_rec.table_name;
    END LOOP;
END $$;

-- Drop and recreate the problematic trigger if it exists
DROP TRIGGER IF EXISTS handle_new_brand_campaign_trigger ON public.brand_campaigns;
DROP TRIGGER IF EXISTS notify_admin_new_campaign_trigger ON public.brand_campaigns;

-- Recreate the notify admin trigger properly
CREATE TRIGGER notify_admin_new_campaign_trigger
  AFTER INSERT ON public.brand_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_campaign();