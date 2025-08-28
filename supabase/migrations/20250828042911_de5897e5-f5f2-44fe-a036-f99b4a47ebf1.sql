-- Remove the problematic trigger function that's causing campaign approval failures
-- First drop any triggers that might be using this function
DROP TRIGGER IF EXISTS create_campaign_approval_request_trigger ON brand_campaigns;

-- Now drop the incomplete function that's causing the "control reached end of trigger procedure without RETURN" error
DROP FUNCTION IF EXISTS public.create_campaign_approval_request();