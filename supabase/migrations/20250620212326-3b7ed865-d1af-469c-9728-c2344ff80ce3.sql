
-- Add referral tracking tables and update existing ones
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMP WITH TIME ZONE,
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(referrer_id, referred_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON user_referrals(referred_id);

-- Add referral_code to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := 'REF' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 5));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Update profiles to have referral codes for existing users
UPDATE profiles 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

-- Function to calculate tiered referral points
CREATE OR REPLACE FUNCTION calculate_referral_points(referrer_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  active_referral_count INTEGER;
  points INTEGER;
BEGIN
  -- Count active referrals
  SELECT COUNT(*) INTO active_referral_count
  FROM user_referrals
  WHERE referrer_id = calculate_referral_points.referrer_id AND is_active = true;
  
  -- Tiered point system
  IF active_referral_count < 5 THEN
    points := 10; -- First 5 referrals: 10 points each
  ELSIF active_referral_count < 15 THEN
    points := 20; -- Next 10 referrals: 20 points each
  ELSE
    points := 30; -- After 15 referrals: 30 points each
  END IF;
  
  RETURN points;
END;
$$;

-- Function to activate a referral when conditions are met
CREATE OR REPLACE FUNCTION check_and_activate_referral(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger to check for referral activation when user completes tasks or earns points
CREATE OR REPLACE FUNCTION handle_referral_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user's activity warrants referral activation
  IF (NEW.tasks_completed > OLD.tasks_completed) OR 
     (NEW.points >= 50 AND OLD.points < 50) THEN
    PERFORM check_and_activate_referral(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral activation
DROP TRIGGER IF EXISTS trigger_referral_activation ON profiles;
CREATE TRIGGER trigger_referral_activation
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_activation();

-- Function to handle new user signup with referral code
CREATE OR REPLACE FUNCTION handle_referral_signup(new_user_id UUID, referral_code_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Add RLS policies for user_referrals
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON user_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service can insert referrals"
  ON user_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update referrals"
  ON user_referrals FOR UPDATE
  USING (true);
