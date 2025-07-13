
-- Fix all functions with mutable search_path security issues
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.post_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.post_comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id AND likes_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL) THEN
    UPDATE public.post_comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL) THEN
    UPDATE public.post_comments
    SET reply_count = reply_count - 1
    WHERE id = OLD.parent_comment_id AND reply_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_referral_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update referrer's counts when a referral is activated/deactivated
  IF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    IF NEW.is_active = true THEN
      -- Referral was activated
      UPDATE public.profiles 
      SET active_referrals_count = active_referrals_count + 1
      WHERE id = NEW.referrer_id;
    ELSE
      -- Referral was deactivated
      UPDATE public.profiles 
      SET active_referrals_count = GREATEST(0, active_referrals_count - 1)
      WHERE id = NEW.referrer_id;
    END IF;
  END IF;
  
  -- Update total referrals count on insert
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET total_referrals_count = total_referrals_count + 1
    WHERE id = NEW.referrer_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_posting_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update chat posting eligibility when tasks_completed or active_referrals_count changes
  IF (NEW.tasks_completed IS DISTINCT FROM OLD.tasks_completed) OR 
     (NEW.active_referrals_count IS DISTINCT FROM OLD.active_referrals_count) THEN
    NEW.can_post_in_chat := check_chat_posting_eligibility(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment follower count for the user being followed
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

    -- Increment following count for the user who is following
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement follower count for the user who was followed
    UPDATE public.profiles
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id AND followers_count > 0;

    -- Decrement following count for the user who was following
    UPDATE public.profiles
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id AND following_count > 0;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_story_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories
    SET view_count = view_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.stories
    SET view_count = view_count - 1
    WHERE id = OLD.story_id AND view_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET reply_count = reply_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET reply_count = reply_count - 1
    WHERE id = OLD.post_id AND reply_count > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_referral_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user's activity warrants referral activation
  IF (NEW.tasks_completed > OLD.tasks_completed) OR 
     (NEW.points >= 50 AND OLD.points < 50) THEN
    PERFORM check_and_activate_referral(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.handle_task_completion_tracking()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.detect_referral_fraud()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  referrer_signup_data RECORD;
  referred_signup_data RECORD;
  duplicate_count INTEGER;
BEGIN
  -- Get signup data for both referrer and referred user
  SELECT * INTO referrer_signup_data 
  FROM public.user_signup_data 
  WHERE user_id = NEW.referrer_id;
  
  SELECT * INTO referred_signup_data 
  FROM public.user_signup_data 
  WHERE user_id = NEW.referred_id;
  
  -- Check if both records exist
  IF referrer_signup_data IS NOT NULL AND referred_signup_data IS NOT NULL THEN
    -- Check for same IP address
    IF referrer_signup_data.ip_address = referred_signup_data.ip_address THEN
      INSERT INTO public.fraud_flags (
        flag_type, user_id, related_user_id, flag_reason, evidence, severity
      ) VALUES (
        'duplicate_referral',
        NEW.referrer_id,
        NEW.referred_id,
        'Same IP address detected for referrer and referred user',
        jsonb_build_object(
          'referrer_ip', referrer_signup_data.ip_address,
          'referred_ip', referred_signup_data.ip_address,
          'referrer_signup', referrer_signup_data.signup_timestamp,
          'referred_signup', referred_signup_data.signup_timestamp
        ),
        'high'
      );
    END IF;
    
    -- Check for same device fingerprint
    IF referrer_signup_data.device_fingerprint = referred_signup_data.device_fingerprint 
       AND referrer_signup_data.device_fingerprint IS NOT NULL THEN
      INSERT INTO public.fraud_flags (
        flag_type, user_id, related_user_id, flag_reason, evidence, severity
      ) VALUES (
        'duplicate_referral',
        NEW.referrer_id,
        NEW.referred_id,
        'Same device fingerprint detected for referrer and referred user',
        jsonb_build_object(
          'device_fingerprint', referrer_signup_data.device_fingerprint,
          'referrer_signup', referrer_signup_data.signup_timestamp,
          'referred_signup', referred_signup_data.signup_timestamp
        ),
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
