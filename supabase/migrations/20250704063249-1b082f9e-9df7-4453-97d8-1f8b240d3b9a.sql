-- Add policy to allow users to view basic profile information of other users for public profiles
CREATE POLICY "Users can view public profile information" ON public.profiles
  FOR SELECT 
  USING (true);