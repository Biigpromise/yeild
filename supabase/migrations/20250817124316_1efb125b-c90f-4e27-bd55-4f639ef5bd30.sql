-- Fix the policy name conflict
DROP POLICY IF EXISTS "Users can view their own referrals" ON user_referrals;
DROP POLICY IF EXISTS "Users can view their referrals" ON user_referrals;

CREATE POLICY "Users can view referral data" 
ON user_referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Ensure admin user has proper access
SELECT verify_admin_access_secure('yeildsocials@gmail.com');