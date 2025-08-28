-- Remove the problematic trigger and function that's causing campaign approval failures
-- Use CASCADE to drop both the trigger and function together
DROP FUNCTION IF EXISTS public.create_campaign_approval_request() CASCADE;