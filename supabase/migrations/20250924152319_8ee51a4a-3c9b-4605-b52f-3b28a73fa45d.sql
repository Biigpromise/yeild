-- Re-enable email confirmations but allow the handle_new_user trigger to work properly
-- First, let's ensure our trigger handles the case where profiles might be missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER set search_path = public 
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

  -- Log the successful profile creation
  RAISE NOTICE 'Profile created successfully for user: %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Still return NEW to allow the user creation to succeed
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger that fires when email_confirmed_at is updated (when email is confirmed)
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER set search_path = public 
AS $$
BEGIN
  -- Only run if email_confirmed_at was just set (changed from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Ensure profile exists when email is confirmed
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

    -- Ensure yield wallet exists
    INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Ensure user role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Profile ensured for confirmed user: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_email_confirmed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the email confirmation trigger
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();