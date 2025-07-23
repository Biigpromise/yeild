
-- Fix the handle_new_user function to ensure robust profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile entry with comprehensive data
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
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
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

  -- Create yield wallet
  INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add default user role if no role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing profiles that might have incomplete data
UPDATE public.profiles 
SET 
  points = COALESCE(points, 0),
  level = COALESCE(level, 1),
  tasks_completed = COALESCE(tasks_completed, 0),
  active_referrals_count = COALESCE(active_referrals_count, 0),
  total_referrals_count = COALESCE(total_referrals_count, 0),
  followers_count = COALESCE(followers_count, 0),
  following_count = COALESCE(following_count, 0),
  can_post_in_chat = COALESCE(can_post_in_chat, false),
  task_completion_rate = COALESCE(task_completion_rate, 0.0),
  referral_code = COALESCE(referral_code, generate_referral_code())
WHERE points IS NULL 
   OR level IS NULL 
   OR tasks_completed IS NULL 
   OR active_referrals_count IS NULL 
   OR total_referrals_count IS NULL 
   OR followers_count IS NULL 
   OR following_count IS NULL 
   OR can_post_in_chat IS NULL 
   OR task_completion_rate IS NULL 
   OR referral_code IS NULL;

-- Create profiles for any auth.users who don't have them yet
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
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name', 
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
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
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Create yield wallets for any users who don't have them
INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
SELECT 
  p.id,
  0,
  0,
  0
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.yield_wallets yw WHERE yw.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure all users have the default user role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  'user'
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'user')
ON CONFLICT (user_id, role) DO NOTHING;
