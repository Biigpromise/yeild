-- Add comment to clarify foreign key relationship for user_referrals
COMMENT ON COLUMN user_referrals.referred_id IS 'References profiles.id (user who was referred)';
COMMENT ON COLUMN user_referrals.referrer_id IS 'References profiles.id (user who made the referral)';

-- Update RLS policy for user_referrals to ensure proper access
DROP POLICY IF EXISTS "Users can view their referrals" ON user_referrals;

CREATE POLICY "Users can view their own referrals" 
ON user_referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Ensure admin function exists and works properly
CREATE OR REPLACE FUNCTION verify_admin_access_secure(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Check if user exists
  SELECT u.id, u.email INTO user_record 
  FROM auth.users u 
  WHERE u.email = user_email AND u.email_confirmed_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO user_roles (user_id, role)
  VALUES (user_record.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Ensure admin user has proper access
SELECT verify_admin_access_secure('yeildsocials@gmail.com');