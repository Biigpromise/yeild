-- Ensure admin role exists for the main admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'yeildsocials@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);

-- Create a function to handle referral signup with better error handling
CREATE OR REPLACE FUNCTION public.handle_referral_signup_improved(new_user_id uuid, referral_code_param text)
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
    
    -- Update total referrals count
    UPDATE profiles 
    SET total_referrals_count = total_referrals_count + 1
    WHERE id = referrer_id;
  END IF;
END;
$$;

-- Create a policy to allow referral link access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_referrals' 
    AND policyname = 'Allow referral signup'
  ) THEN
    CREATE POLICY "Allow referral signup" ON public.user_referrals
    FOR INSERT
    WITH CHECK (true);
  END IF;
END
$$;