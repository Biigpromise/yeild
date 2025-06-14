
-- Fix the search_path parameter for all database functions to improve security

-- Update the has_role function to include search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update the redeem_reward function to include search_path
CREATE OR REPLACE FUNCTION public.redeem_reward(p_user_id uuid, p_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  reward_record RECORD;
  user_points INTEGER;
  redemption_id UUID;
  redemption_code TEXT;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record FROM public.rewards 
  WHERE id = p_reward_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  -- Check stock
  IF reward_record.stock_quantity IS NOT NULL AND reward_record.stock_quantity <= 0 THEN
    RAISE EXCEPTION 'Reward out of stock';
  END IF;
  
  -- Get user points
  SELECT points INTO user_points FROM public.profiles WHERE id = p_user_id;
  
  -- Check if user has enough points
  IF user_points < reward_record.points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Generate redemption code
  redemption_code := 'RDM-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  
  -- Create redemption record
  INSERT INTO public.reward_redemptions (user_id, reward_id, points_spent, redemption_code)
  VALUES (p_user_id, p_reward_id, reward_record.points_required, redemption_code)
  RETURNING id INTO redemption_id;
  
  -- Deduct points from user
  UPDATE public.profiles 
  SET points = points - reward_record.points_required,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record the transaction
  INSERT INTO public.point_transactions (user_id, points, transaction_type, reference_id, description)
  VALUES (p_user_id, -reward_record.points_required, 'reward_redemption', p_reward_id, 
          'Redeemed: ' || reward_record.title);
  
  -- Update stock if applicable
  IF reward_record.stock_quantity IS NOT NULL THEN
    UPDATE public.rewards 
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_reward_id;
  END IF;
  
  RETURN redemption_id;
END;
$$;

-- Update the check_and_award_achievements function to include search_path
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  achievement_record RECORD;
  user_profile RECORD;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
  LOOP
    -- Check if user meets the requirement
    IF (achievement_record.requirement_type = 'tasks_completed' AND user_profile.tasks_completed >= achievement_record.requirement_value) OR
       (achievement_record.requirement_type = 'points_earned' AND user_profile.points >= achievement_record.requirement_value) THEN
       
      -- Award the achievement
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (p_user_id, achievement_record.id);
      
      -- Award points if any
      IF achievement_record.points_reward > 0 THEN
        UPDATE public.profiles 
        SET points = points + achievement_record.points_reward,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Record the transaction
        INSERT INTO public.point_transactions (user_id, points, transaction_type, reference_id, description)
        VALUES (p_user_id, achievement_record.points_reward, 'achievement', achievement_record.id, 
                'Achievement: ' || achievement_record.title);
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Update the handle_submission_approval function to include search_path
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If submission was just approved, award points
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Get task points
    UPDATE public.profiles 
    SET 
      points = points + (SELECT points FROM public.tasks WHERE id = NEW.task_id),
      tasks_completed = tasks_completed + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Update user_tasks table
    INSERT INTO public.user_tasks (user_id, task_id, status, completed_at, points_earned)
    VALUES (NEW.user_id, NEW.task_id, 'completed', NOW(), 
            (SELECT points FROM public.tasks WHERE id = NEW.task_id))
    ON CONFLICT (user_id, task_id) 
    DO UPDATE SET 
      status = 'completed',
      completed_at = NOW(),
      points_earned = (SELECT points FROM public.tasks WHERE id = NEW.task_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the handle_new_user function to include search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Update the get_current_user_profile function to include search_path
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(id uuid, email text, name text, points integer, level integer, tasks_completed integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.email, p.name, p.points, p.level, p.tasks_completed
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;
