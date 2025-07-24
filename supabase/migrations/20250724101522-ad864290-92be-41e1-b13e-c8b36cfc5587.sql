-- Critical Security Fix: Add search_path to all database functions to prevent SQL injection

-- Fix verify_single_admin_access function
CREATE OR REPLACE FUNCTION public.verify_single_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_id_param uuid, 
  event_type text, 
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id, 
    activity_type, 
    activity_data,
    ip_address,
    user_agent
  ) VALUES (
    user_id_param,
    'security_event',
    jsonb_build_object(
      'event_type', event_type,
      'details', event_details,
      'timestamp', now()
    ),
    inet_client_addr()::text,
    current_setting('application_name', true)
  );
END;
$$;

-- Fix all other security definer functions that might be missing search_path
CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id_param uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_id_param 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.sanitize_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove potentially dangerous characters and normalize
  RETURN trim(regexp_replace(input_text, '[<>"\''&]', '', 'g'));
END;
$$;

CREATE OR REPLACE FUNCTION public.check_chat_posting_eligibility(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(p.tasks_completed, 0) >= 1 AND 
    COALESCE(p.active_referrals_count, 0) >= 3
  FROM profiles p
  WHERE p.id = user_id_param;
$$;