-- Fix remaining security issues

-- Fix the SECURITY DEFINER view by removing that property
CREATE OR REPLACE VIEW public.performance_monitor AS
SELECT 
  schemaname,
  relname as tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  CASE 
    WHEN (seq_scan + COALESCE(idx_scan, 0)) > 0 
    THEN ROUND((seq_scan::numeric / (seq_scan + COALESCE(idx_scan, 0))::numeric) * 100, 2)
    ELSE 0 
  END as seq_scan_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan_percentage DESC;

-- Fix remaining functions without proper search_path
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  brand_name TEXT;
BEGIN
  -- Get brand name
  SELECT COALESCE(bp.company_name, p.name, p.email)
  INTO brand_name
  FROM public.profiles p
  LEFT JOIN public.brand_profiles bp ON bp.user_id = p.id
  WHERE p.id = NEW.brand_id;

  -- Create admin notification
  INSERT INTO public.admin_notifications (type, message, link_to)
  VALUES (
    'new_campaign',
    'New campaign "' || NEW.title || '" created by ' || COALESCE(brand_name, 'Unknown Brand') || ' with budget ₦' || NEW.budget::text,
    '/admin?section=campaigns&campaign=' || NEW.id
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile entry with comprehensive data
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    referral_code,
    points,
    level,
    tasks_completed,
    active_referrals_count,
    total_referrals_count,
    followers_count,
    following_count,
    can_post_in_chat,
    task_completion_rate
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    generate_referral_code(),
    0,  -- points
    1,  -- level
    0,  -- tasks_completed
    0,  -- active_referrals_count
    0,  -- total_referrals_count
    0,  -- followers_count
    0,  -- following_count
    false,  -- can_post_in_chat
    0.0  -- task_completion_rate
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    referral_code = COALESCE(profiles.referral_code, generate_referral_code()),
    updated_at = now();

  -- Create yield wallet
  INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add default user role if no role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;