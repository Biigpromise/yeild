-- Update bird levels with correct requirements and real bird representations
UPDATE bird_levels SET 
  min_referrals = 0,
  min_points = 0,
  icon = '🕊️',
  emoji = '🕊️',
  description = 'Starting your journey - Welcome to the family!'
WHERE name = 'Dove';

UPDATE bird_levels SET 
  min_referrals = 5,
  min_points = 100,
  icon = '🐦',
  emoji = '🐦', 
  description = 'Building connections - You are growing your network!'
WHERE name = 'Sparrow';

UPDATE bird_levels SET 
  min_referrals = 20,
  min_points = 500,
  icon = '🦅',
  emoji = '🦅',
  description = 'Sharp focus and precision - You are mastering the art of networking!'
WHERE name = 'Hawk';

UPDATE bird_levels SET 
  min_referrals = 50,
  min_points = 1500,
  icon = '🦅',
  emoji = '🦅',
  description = 'Soaring high with leadership - You command respect in your network!'
WHERE name = 'Eagle';

UPDATE bird_levels SET 
  min_referrals = 100,
  min_points = 5000,
  icon = '🦅',
  emoji = '🦅',
  description = 'Speed and excellence - You are at the peak of performance!'
WHERE name = 'Falcon';

UPDATE bird_levels SET 
  min_referrals = 1000,
  min_points = 50000,
  icon = '🔥',
  emoji = '🔥',
  description = 'Legendary status - Rising from the ashes stronger than ever!'
WHERE name = 'Phoenix';

-- Add user tour completion tracking
CREATE TABLE IF NOT EXISTS user_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_completed BOOLEAN DEFAULT FALSE,
  tour_step INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_tours ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tours
CREATE POLICY "Users can view their own tour status" 
  ON user_tours FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tour status" 
  ON user_tours FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tour status" 
  ON user_tours FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to initialize tour for new users
CREATE OR REPLACE FUNCTION initialize_user_tour()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_tours (user_id, tour_completed, tour_step)
  VALUES (NEW.id, FALSE, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize tour for new users
CREATE TRIGGER on_auth_user_created_tour
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_tour();