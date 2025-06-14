
-- Create user sessions table to track login history and session data
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  location_country TEXT,
  location_city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity tracking table for detailed monitoring
CREATE TABLE public.user_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'logout', 'task_start', 'task_complete', 'page_view', etc.
  activity_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user streaks tracking table
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL, -- 'login', 'task_completion', 'daily_active'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Add additional columns to profiles table for enhanced tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_session_time INTEGER DEFAULT 0; -- in minutes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS task_completion_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_session_duration INTEGER DEFAULT 0; -- in minutes

-- Enable RLS on new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_sessions (users can only see their own sessions)
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_activity_log (users can only see their own activity)
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_streaks (users can only see their own streaks)
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can view all activity" ON public.user_activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can view all streaks" ON public.user_streaks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Function to update user streaks
CREATE OR REPLACE FUNCTION public.update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT,
  p_activity_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  streak_record RECORD;
  days_diff INTEGER;
BEGIN
  -- Get current streak record
  SELECT * INTO streak_record 
  FROM public.user_streaks 
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (
      user_id, streak_type, current_streak, longest_streak, 
      last_activity_date, streak_start_date
    ) VALUES (
      p_user_id, p_streak_type, 1, 1, 
      p_activity_date, p_activity_date
    );
  ELSE
    -- Calculate days difference
    days_diff := p_activity_date - streak_record.last_activity_date;
    
    IF days_diff = 1 THEN
      -- Continue streak
      UPDATE public.user_streaks 
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = p_activity_date,
        updated_at = now()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    ELSIF days_diff = 0 THEN
      -- Same day, no change needed
      RETURN;
    ELSE
      -- Streak broken, reset
      UPDATE public.user_streaks 
      SET 
        current_streak = 1,
        last_activity_date = p_activity_date,
        streak_start_date = p_activity_date,
        updated_at = now()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    END IF;
  END IF;
END;
$$;

-- Function to calculate task completion rate
CREATE OR REPLACE FUNCTION public.calculate_task_completion_rate(p_user_id UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_started INTEGER;
  total_completed INTEGER;
  completion_rate DECIMAL(5,2);
BEGIN
  -- Count total tasks started
  SELECT COUNT(*) INTO total_started
  FROM public.user_tasks
  WHERE user_id = p_user_id AND status IN ('started', 'completed');

  -- Count total tasks completed
  SELECT COUNT(*) INTO total_completed
  FROM public.user_tasks
  WHERE user_id = p_user_id AND status = 'completed';

  -- Calculate completion rate
  IF total_started > 0 THEN
    completion_rate := (total_completed::DECIMAL / total_started::DECIMAL) * 100;
  ELSE
    completion_rate := 0.00;
  END IF;

  RETURN completion_rate;
END;
$$;

-- Trigger to update profiles when user completes tasks
CREATE OR REPLACE FUNCTION public.handle_task_completion_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If task was just completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update task completion streak
    PERFORM public.update_user_streak(NEW.user_id, 'task_completion');
    
    -- Update task completion rate in profiles
    UPDATE public.profiles
    SET 
      task_completion_rate = public.calculate_task_completion_rate(NEW.user_id),
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for task completion tracking
DROP TRIGGER IF EXISTS track_task_completion ON public.user_tasks;
CREATE TRIGGER track_task_completion
  AFTER INSERT OR UPDATE ON public.user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_completion_tracking();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_active ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id_type ON public.user_activity_log(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id_type ON public.user_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
