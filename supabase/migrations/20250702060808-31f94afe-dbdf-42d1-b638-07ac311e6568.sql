-- Create bird_levels table for configurable badge thresholds
CREATE TABLE IF NOT EXISTS public.bird_levels (
  id serial PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  emoji text NOT NULL,
  min_referrals integer NOT NULL,
  min_points integer DEFAULT 0,
  description text NOT NULL,
  color text NOT NULL,
  benefits text[] DEFAULT '{}',
  animation_type text DEFAULT 'static',
  glow_effect boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default bird levels
INSERT INTO public.bird_levels (name, icon, emoji, min_referrals, min_points, description, color, benefits, animation_type, glow_effect) VALUES
('Dove', 'dove', '🕊️', 0, 0, 'Starting your referral journey', '#94a3b8', ARRAY['Basic profile features'], 'static', false),
('Sparrow', 'bird', '🐦', 5, 100, 'First steps taken', '#84cc16', ARRAY['Profile customization', 'Basic rewards'], 'static', false),
('Hawk', 'zap', '🦅', 20, 500, 'Rising through the ranks', '#f59e0b', ARRAY['Priority support', 'Enhanced visibility'], 'static', true),
('Eagle', 'crown', '🦅🔥', 100, 2500, 'Soaring to new heights', '#dc2626', ARRAY['Exclusive features', 'Premium rewards', 'Special recognition'], 'wing-flap', true),
('Falcon', 'gem', '🐦‍🔥', 500, 12500, 'Elite performer', '#7c3aed', ARRAY['VIP status', 'Maximum rewards', 'Early access'], 'hover-motion', true),
('Phoenix', 'flame', '🔥🕊️', 1000, 25000, 'Legendary achievement', '#ec4899', ARRAY['Ultimate recognition', 'Exclusive perks', 'Hall of fame'], 'full-animation', true);

-- Enable RLS
ALTER TABLE public.bird_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view bird levels" ON public.bird_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage bird levels" ON public.bird_levels
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Function to get user's current bird level
CREATE OR REPLACE FUNCTION public.get_user_bird_level(user_id_param uuid)
RETURNS TABLE(
  id integer,
  name text,
  icon text,
  emoji text,
  min_referrals integer,
  min_points integer,
  description text,
  color text,
  benefits text[],
  animation_type text,
  glow_effect boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_referrals integer;
  user_points integer;
BEGIN
  -- Get user's stats
  SELECT active_referrals_count, points INTO user_referrals, user_points
  FROM profiles 
  WHERE profiles.id = user_id_param;
  
  -- Return the highest bird level the user qualifies for
  RETURN QUERY
  SELECT bl.id, bl.name, bl.icon, bl.emoji, bl.min_referrals, bl.min_points, 
         bl.description, bl.color, bl.benefits, bl.animation_type, bl.glow_effect
  FROM bird_levels bl
  WHERE bl.min_referrals <= COALESCE(user_referrals, 0) 
    AND bl.min_points <= COALESCE(user_points, 0)
  ORDER BY bl.min_referrals DESC, bl.min_points DESC
  LIMIT 1;
END;
$$;

-- Function to get next bird level goal
CREATE OR REPLACE FUNCTION public.get_next_bird_level(user_id_param uuid)
RETURNS TABLE(
  id integer,
  name text,
  icon text,
  emoji text,
  min_referrals integer,
  min_points integer,
  description text,
  color text,
  referrals_needed integer,
  points_needed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_referrals integer;
  user_points integer;
BEGIN
  -- Get user's stats
  SELECT active_referrals_count, points INTO user_referrals, user_points
  FROM profiles 
  WHERE profiles.id = user_id_param;
  
  -- Return the next bird level the user can achieve
  RETURN QUERY
  SELECT bl.id, bl.name, bl.icon, bl.emoji, bl.min_referrals, bl.min_points, 
         bl.description, bl.color,
         GREATEST(0, bl.min_referrals - COALESCE(user_referrals, 0)) as referrals_needed,
         GREATEST(0, bl.min_points - COALESCE(user_points, 0)) as points_needed
  FROM bird_levels bl
  WHERE bl.min_referrals > COALESCE(user_referrals, 0) 
     OR bl.min_points > COALESCE(user_points, 0)
  ORDER BY bl.min_referrals ASC, bl.min_points ASC
  LIMIT 1;
END;
$$;