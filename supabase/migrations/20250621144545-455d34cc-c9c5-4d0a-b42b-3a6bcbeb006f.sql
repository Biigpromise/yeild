
-- Fix search_path for update_story_view_count function
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

-- Fix search_path for update_post_reply_count function
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

-- Fix search_path for increment_post_view function
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id_to_inc uuid, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Try to insert a new view record (will fail if already exists due to unique constraint)
  INSERT INTO public.post_views (post_id, user_id)
  VALUES (post_id_to_inc, user_id_param)
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  -- Update the post view count based on actual unique views
  UPDATE public.posts
  SET view_count = (
    SELECT COUNT(*)
    FROM public.post_views
    WHERE post_id = post_id_to_inc
  )
  WHERE id = post_id_to_inc;
END;
$$;

-- Fix search_path for generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := 'REF' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 5));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Fix search_path for update_referral_counts function
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

-- Fix search_path for verify_single_admin_access function
CREATE OR REPLACE FUNCTION public.verify_single_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user exists and assign admin role if they don't have it
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email
  ) THEN
    -- Get the user ID and insert admin role
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'admin'
    FROM auth.users au
    WHERE au.email = user_email
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = au.id AND ur.role = 'admin'
      );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Fix search_path for detect_referral_fraud function
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
