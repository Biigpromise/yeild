-- Add referral commission functionality
-- Function to award referral commission when downline earns points
CREATE OR REPLACE FUNCTION public.award_referral_commission(
  downline_user_id UUID,
  points_earned INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_record RECORD;
  commission_points INTEGER := 10; -- Fixed 10 points commission
BEGIN
  -- Find the active referrer for this user
  SELECT ur.referrer_id INTO referrer_record
  FROM user_referrals ur
  WHERE ur.referred_id = downline_user_id 
    AND ur.is_active = true
  LIMIT 1;
  
  -- If user has an active referrer, award commission
  IF referrer_record.referrer_id IS NOT NULL THEN
    -- Award points to referrer
    UPDATE profiles
    SET points = points + commission_points,
        updated_at = now()
    WHERE id = referrer_record.referrer_id;
    
    -- Record the commission transaction
    INSERT INTO point_transactions (
      user_id,
      points,
      transaction_type,
      reference_id,
      description
    ) VALUES (
      referrer_record.referrer_id,
      commission_points,
      'referral_commission',
      downline_user_id,
      'Referral commission from downline earnings'
    );
  END IF;
END;
$$;

-- Update the submission approval function to include referral commission
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  task_points INTEGER;
BEGIN
  -- If submission was just approved, award points
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Get task points
    SELECT points INTO task_points FROM public.tasks WHERE id = NEW.task_id;
    
    -- Update user profile
    UPDATE public.profiles 
    SET 
      points = points + task_points,
      tasks_completed = tasks_completed + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Record the main transaction
    INSERT INTO public.point_transactions (user_id, points, transaction_type, reference_id, description)
    VALUES (NEW.user_id, task_points, 'task_completion', NEW.task_id, 
            'Task completion: ' || (SELECT title FROM public.tasks WHERE id = NEW.task_id));
    
    -- Award referral commission to upline
    PERFORM public.award_referral_commission(NEW.user_id, task_points);
    
    -- Update user_tasks table
    INSERT INTO public.user_tasks (user_id, task_id, status, completed_at, points_earned)
    VALUES (NEW.user_id, NEW.task_id, 'completed', NOW(), task_points)
    ON CONFLICT (user_id, task_id) 
    DO UPDATE SET 
      status = 'completed',
      completed_at = NOW(),
      points_earned = task_points;
  END IF;
  
  RETURN NEW;
END;
$$;