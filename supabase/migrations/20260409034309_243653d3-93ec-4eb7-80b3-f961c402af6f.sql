-- Drop the overly permissive profiles SELECT policy that exposes all user data
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Tighten marketplace_interactions INSERT policy
DROP POLICY IF EXISTS "Users can create interactions" ON public.marketplace_interactions;
CREATE POLICY "Users can create own interactions" ON public.marketplace_interactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tighten user_referrals INSERT policy
DROP POLICY IF EXISTS "Users can create referrals" ON public.user_referrals;
CREATE POLICY "Users can create own referrals" ON public.user_referrals
  FOR INSERT TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Tighten user_referrals UPDATE policy
DROP POLICY IF EXISTS "Users can update referrals" ON public.user_referrals;
CREATE POLICY "Users can update own referrals" ON public.user_referrals
  FOR UPDATE TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());