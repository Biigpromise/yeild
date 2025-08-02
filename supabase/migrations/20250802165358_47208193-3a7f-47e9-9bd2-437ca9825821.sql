-- Fix the foreign key relationship for user_referrals table
-- First check if the foreign key exists and recreate it if needed

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key from user_referrals.referrer_id to profiles.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_referrals_referrer_id_fkey' 
        AND table_name = 'user_referrals'
    ) THEN
        ALTER TABLE user_referrals 
        ADD CONSTRAINT user_referrals_referrer_id_fkey 
        FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key from user_referrals.referred_id to profiles.id  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_referrals_referred_id_fkey' 
        AND table_name = 'user_referrals'
    ) THEN
        ALTER TABLE user_referrals 
        ADD CONSTRAINT user_referrals_referred_id_fkey 
        FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create a more robust function to handle referral signup processing
CREATE OR REPLACE FUNCTION public.process_referral_signup_complete(referral_code_param text, new_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_record RECORD;
  result json;
BEGIN
  -- Find the referrer by referral code
  SELECT id, total_referrals_count INTO referrer_record
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Check if this referral already exists
  IF EXISTS (
    SELECT 1 FROM user_referrals 
    WHERE referrer_id = referrer_record.id 
    AND referred_id = new_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Referral already exists');
  END IF;
  
  -- Create the referral relationship
  INSERT INTO user_referrals (
    referrer_id,
    referred_id, 
    referral_code,
    is_active
  ) VALUES (
    referrer_record.id,
    new_user_id,
    referral_code_param,
    false
  );
  
  -- Update referrer's total referral count
  UPDATE profiles 
  SET total_referrals_count = COALESCE(total_referrals_count, 0) + 1
  WHERE id = referrer_record.id;
  
  RETURN json_build_object(
    'success', true, 
    'referrer_id', referrer_record.id,
    'referred_id', new_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;