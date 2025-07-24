-- Fix all remaining database functions that need search_path security setting

CREATE OR REPLACE FUNCTION public.check_and_activate_referral(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  -- 1. Has completed at least 1 task OR
  -- 2. Has earned at least 50 points
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
    
    -- Record the transaction
    INSERT INTO point_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (referral_record.referrer_id, points_to_award, 'referral_bonus', referral_record.id, 
            'Active referral bonus for user: ' || user_profile.name);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_reward(p_user_id uuid, p_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reward_record RECORD;
  user_points INTEGER;
  redemption_id UUID;
  redemption_code TEXT;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record FROM public.rewards 
  WHERE id = p_reward_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  -- Check stock
  IF reward_record.stock_quantity IS NOT NULL AND reward_record.stock_quantity <= 0 THEN
    RAISE EXCEPTION 'Reward out of stock';
  END IF;
  
  -- Get user points
  SELECT points INTO user_points FROM public.profiles WHERE id = p_user_id;
  
  -- Check if user has enough points
  IF user_points < reward_record.points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Generate redemption code
  redemption_code := 'RDM-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  
  -- Create redemption record
  INSERT INTO public.reward_redemptions (user_id, reward_id, points_spent, redemption_code)
  VALUES (p_user_id, p_reward_id, reward_record.points_required, redemption_code)
  RETURNING id INTO redemption_id;
  
  -- Deduct points from user
  UPDATE public.profiles 
  SET points = points - reward_record.points_required,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record the transaction
  INSERT INTO public.point_transactions (user_id, points, transaction_type, reference_id, description)
  VALUES (p_user_id, -reward_record.points_required, 'reward_redemption', p_reward_id, 
          'Redeemed: ' || reward_record.title);
  
  -- Update stock if applicable
  IF reward_record.stock_quantity IS NOT NULL THEN
    UPDATE public.rewards 
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_reward_id;
  END IF;
  
  RETURN redemption_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_brand_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the application status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Assign the 'brand' role to the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'brand')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_referral_signup(new_user_id uuid, referral_code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Find the referrer by referral code
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF FOUND THEN
    -- Create the referral record
    INSERT INTO user_referrals (referrer_id, referred_id, referral_code)
    VALUES (referrer_id, new_user_id, referral_code_param)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
  END IF;
END;
$$;