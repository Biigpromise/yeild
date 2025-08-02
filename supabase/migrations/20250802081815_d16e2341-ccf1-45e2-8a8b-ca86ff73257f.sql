-- Update the handle_submission_approval function to send notifications when tasks are approved
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  task_points INTEGER;
  task_title TEXT;
BEGIN
  -- If submission was just approved, award points and send notification
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Get task points and title
    SELECT points, title INTO task_points, task_title FROM public.tasks WHERE id = NEW.task_id;
    
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
            'Task completion: ' || task_title);
    
    -- Create notification for the user
    INSERT INTO public.notifications (user_id, type, title, content)
    VALUES (
      NEW.user_id,
      'task_approved',
      'Task Approved! 🎉',
      'Congratulations! Your submission for "' || task_title || '" has been approved and you earned ' || task_points || ' points!'
    );
    
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