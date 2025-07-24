-- Fix remaining functions that need search_path security setting

CREATE OR REPLACE FUNCTION public.increment_message_view(message_id_param uuid, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Try to insert a new view record (will fail if already exists due to unique constraint)
  INSERT INTO public.message_views (message_id, user_id)
  VALUES (message_id_param, user_id_param)
  ON CONFLICT (message_id, user_id) DO NOTHING;
  
  -- Update the message view count based on actual unique views
  UPDATE public.messages
  SET views_count = (
    SELECT COUNT(*)
    FROM public.message_views
    WHERE message_id = message_id_param
  )
  WHERE id = message_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_leaderboard_data()
RETURNS TABLE(id uuid, name text, points integer, level integer, tasks_completed integer, profile_picture_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.handle_referral_signup_improved(new_user_id uuid, referral_code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Find the referrer by referral code
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF FOUND THEN
    -- Create the referral record
    INSERT INTO user_referrals (referrer_id, referred_id, referral_code)
    VALUES (referrer_id, new_user_id, referral_code_param)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    -- Update total referrals count
    UPDATE profiles 
    SET total_referrals_count = total_referrals_count + 1
    WHERE id = referrer_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_brand_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is a brand user
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'brand') THEN
    INSERT INTO public.brand_wallets (brand_id, balance, total_deposited, total_spent)
    VALUES (NEW.id, 0.00, 0.00, 0.00)
    ON CONFLICT (brand_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_brand_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  application_data jsonb;
  company_name_text text;
BEGIN
  -- Check if brand_application_data exists in the new user's metadata
  IF NEW.raw_user_meta_data ? 'brand_application_data' THEN
    application_data := NEW.raw_user_meta_data -> 'brand_application_data';
    company_name_text := application_data ->> 'companyName';

    -- Insert the application data into the brand_applications table
    INSERT INTO public.brand_applications (
      user_id,
      company_name,
      website,
      company_size,
      industry,
      task_types,
      budget,
      goals
    )
    VALUES (
      NEW.id,
      company_name_text,
      application_data ->> 'website',
      application_data ->> 'companySize',
      application_data ->> 'industry',
      application_data -> 'taskTypes',
      application_data ->> 'budget',
      application_data ->> 'goals'
    );

    -- Insert a notification for admins
    INSERT INTO public.admin_notifications (type, message, link_to)
    VALUES ('new_brand_application', 'New brand application from ' || company_name_text, '/admin?section=brands');

  END IF;
  
  RETURN NEW;
END;
$$;