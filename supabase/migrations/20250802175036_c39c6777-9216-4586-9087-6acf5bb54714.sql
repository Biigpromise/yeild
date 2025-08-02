-- Fix foreign key relationships in user_referrals table to reference profiles instead of auth.users
-- This will resolve the "failed to load referrals" error

-- First, remove existing foreign key constraints if they exist
ALTER TABLE user_referrals 
DROP CONSTRAINT IF EXISTS user_referrals_referrer_id_fkey,
DROP CONSTRAINT IF EXISTS user_referrals_referred_id_fkey;

-- Add new foreign key constraints that reference the profiles table
ALTER TABLE user_referrals 
ADD CONSTRAINT user_referrals_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT user_referrals_referred_id_fkey 
    FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update the check_and_activate_referral function to be more robust
CREATE OR REPLACE FUNCTION public.check_and_activate_referral(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_data RECORD;
BEGIN
  -- Get user's current stats
  SELECT points, tasks_completed INTO user_data
  FROM profiles 
  WHERE id = user_id;
  
  -- Check if user meets activation criteria (50+ points OR 1+ tasks completed)
  IF (user_data.points >= 50) OR (user_data.tasks_completed >= 1) THEN
    -- Activate any pending referrals for this user
    UPDATE user_referrals 
    SET is_active = true
    WHERE referred_id = user_id 
      AND is_active = false;
      
    -- Update referrer's active referral count
    UPDATE profiles
    SET active_referrals_count = (
      SELECT COUNT(*) FROM user_referrals 
      WHERE referrer_id = profiles.id AND is_active = true
    )
    WHERE id IN (
      SELECT referrer_id FROM user_referrals 
      WHERE referred_id = user_id AND is_active = true
    );
  END IF;
END;
$function$;

-- Add trigger to automatically check referral activation when profiles are updated
DROP TRIGGER IF EXISTS handle_profile_update_referral_activation ON profiles;
CREATE TRIGGER handle_profile_update_referral_activation
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE check_and_activate_referral(NEW.id);

-- Refresh referral counts for all users to ensure consistency
CREATE OR REPLACE FUNCTION public.refresh_referral_counts(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF target_user_id IS NOT NULL THEN
    -- Refresh counts for specific user
    UPDATE profiles
    SET 
      active_referrals_count = (
        SELECT COUNT(*) FROM user_referrals 
        WHERE referrer_id = target_user_id AND is_active = true
      ),
      total_referrals_count = (
        SELECT COUNT(*) FROM user_referrals 
        WHERE referrer_id = target_user_id
      )
    WHERE id = target_user_id;
  ELSE
    -- Refresh counts for all users
    UPDATE profiles
    SET 
      active_referrals_count = (
        SELECT COUNT(*) FROM user_referrals 
        WHERE referrer_id = profiles.id AND is_active = true
      ),
      total_referrals_count = (
        SELECT COUNT(*) FROM user_referrals 
        WHERE referrer_id = profiles.id
      );
  END IF;
END;
$function$;

-- Run a one-time refresh of all referral counts
SELECT refresh_referral_counts();