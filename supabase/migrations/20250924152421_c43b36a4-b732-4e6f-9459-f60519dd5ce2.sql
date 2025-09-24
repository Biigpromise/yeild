-- Create a function to manually fix missing profiles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_profile_for_user(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user data from auth.users
  SELECT * INTO user_record FROM auth.users WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found with id: %', user_id_param;
  END IF;
  
  -- Create profile entry
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    referral_code,
    points,
    level,
    tasks_completed,
    active_referrals_count,
    total_referrals_count,
    followers_count,
    following_count,
    can_post_in_chat,
    task_completion_rate
  )
  VALUES (
    user_record.id, 
    user_record.email, 
    COALESCE(
      user_record.raw_user_meta_data->>'name', 
      user_record.raw_user_meta_data->>'full_name',
      split_part(user_record.email, '@', 1)
    ),
    generate_referral_code(),
    0,  -- points
    1,  -- level
    0,  -- tasks_completed
    0,  -- active_referrals_count
    0,  -- total_referrals_count
    0,  -- followers_count
    0,  -- following_count
    false,  -- can_post_in_chat
    0.0  -- task_completion_rate
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    referral_code = COALESCE(profiles.referral_code, generate_referral_code()),
    updated_at = now();

  -- Ensure yield wallet exists
  INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
  VALUES (user_record.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure user role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_record.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

-- Fix the existing user's profile
SELECT public.create_missing_profile_for_user('05b05ca1-07cb-485c-af9e-592a1b376c41');