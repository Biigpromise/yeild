-- Update the calculate_referral_points function to work with new bird tier system
CREATE OR REPLACE FUNCTION public.calculate_referral_points(referrer_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  active_referral_count INTEGER;
  points INTEGER;
BEGIN
  -- Count active referrals
  SELECT COUNT(*) INTO active_referral_count
  FROM user_referrals
  WHERE referrer_id = calculate_referral_points.referrer_id AND is_active = true;
  
  -- New bird tier point system
  IF active_referral_count < 5 THEN
    points := 10; -- Dove: 0-4 referrals
  ELSIF active_referral_count < 20 THEN
    points := 15; -- Sparrow: 5-19 referrals
  ELSIF active_referral_count < 50 THEN
    points := 20; -- Hawk: 20-49 referrals
  ELSIF active_referral_count < 100 THEN
    points := 25; -- Eagle: 50-99 referrals
  ELSIF active_referral_count < 500 THEN
    points := 30; -- Falcon: 100-499 referrals
  ELSE
    points := 35; -- Phoenix: 500+ referrals
  END IF;
  
  RETURN points;
END;
$function$;