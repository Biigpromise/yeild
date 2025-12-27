-- Create a secure function to get limited public profile data (for leaderboards, etc.)
-- This only returns non-sensitive fields (no email, referral_code, etc.)
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  profile_picture_url text,
  level integer,
  points integer,
  tasks_completed integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    COALESCE(p.name, 'Anonymous User') as name,
    p.profile_picture_url,
    p.level,
    p.points,
    p.tasks_completed
  FROM profiles p
  WHERE p.id = profile_id;
$$;