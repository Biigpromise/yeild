
-- Create a function to get leaderboard data that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_leaderboard_data()
RETURNS TABLE(
  id uuid,
  name text,
  points integer,
  level integer,
  tasks_completed integer,
  profile_picture_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    COALESCE(p.name, 'Anonymous User') as name,
    COALESCE(p.points, 0) as points,
    COALESCE(p.level, 1) as level,
    COALESCE(p.tasks_completed, 0) as tasks_completed,
    p.profile_picture_url
  FROM public.profiles p
  WHERE p.name IS NOT NULL 
    AND p.name != ''
  ORDER BY p.points DESC
  LIMIT 50;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard_data() TO authenticated;
