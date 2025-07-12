-- Fix signup rate limiting and improve email handling
-- First, let's check if we have proper user handling triggers

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.profiles (id, email, name, referral_code)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    generate_referral_code()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    referral_code = COALESCE(profiles.referral_code, generate_referral_code());

  -- Create yield wallet
  INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add default user role if no role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;