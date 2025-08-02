-- Fix referral activation to properly count active referrals when users complete tasks
-- First, let's ensure the activation trigger works correctly

-- Update the check_and_activate_referral function to be more robust
CREATE OR REPLACE FUNCTION public.check_and_activate_referral(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referral_record RECORD;
  user_profile RECORD;
  points_to_award INTEGER;
BEGIN
  -- Check if this user was referred and hasn't been activated yet
  SELECT * INTO referral_record
  FROM user_referrals
  WHERE referred_id = user_id AND is_active = false;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get user's profile to check activity
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = user_id;
  
  -- Check if user meets activation criteria:
  -- Has completed at least 1 task OR has earned at least 50 points
  IF user_profile.tasks_completed > 0 OR user_profile.points >= 50 THEN
    -- Calculate points for this referral tier
    points_to_award := calculate_referral_points(referral_record.referrer_id);
    
    -- Activate the referral
    UPDATE user_referrals
    SET is_active = true,
        activated_at = now(),
        points_awarded = points_to_award
    WHERE id = referral_record.id;
    
    -- Award points to referrer
    UPDATE profiles
    SET points = points + points_to_award,
        updated_at = now()
    WHERE id = referral_record.referrer_id;
    
    -- Update active referrals count for referrer
    UPDATE profiles 
    SET active_referrals_count = active_referrals_count + 1
    WHERE id = referral_record.referrer_id;
    
    -- Record the transaction
    INSERT INTO point_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (referral_record.referrer_id, points_to_award, 'referral_bonus', referral_record.id, 
            'Active referral bonus for user: ' || user_profile.name);
            
    -- Create notification for referrer
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (
      referral_record.referrer_id,
      'referral_activated',
      'Referral Activated!',
      'Your referral of ' || user_profile.name || ' is now active and you earned ' || points_to_award || ' points!'
    );
  END IF;
END;
$function$;

-- Create a function to manually refresh referral counts for troubleshooting
CREATE OR REPLACE FUNCTION public.refresh_referral_counts(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- If target_user_id is provided, only update that user
  -- Otherwise, update all users
  FOR user_record IN 
    SELECT id FROM profiles 
    WHERE (target_user_id IS NULL OR id = target_user_id)
  LOOP
    -- Update active referrals count
    UPDATE profiles 
    SET active_referrals_count = (
      SELECT COUNT(*) 
      FROM user_referrals 
      WHERE referrer_id = user_record.id AND is_active = true
    ),
    total_referrals_count = (
      SELECT COUNT(*) 
      FROM user_referrals 
      WHERE referrer_id = user_record.id
    )
    WHERE id = user_record.id;
  END LOOP;
END;
$function$;