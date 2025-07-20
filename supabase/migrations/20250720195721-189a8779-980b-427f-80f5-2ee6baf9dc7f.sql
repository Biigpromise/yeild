-- Fix RLS recursion issues and update function security
-- First, let's fix the user_roles policies that are causing infinite recursion

-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Admin email access" ON public.user_roles;
DROP POLICY IF EXISTS "Admin user can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create secure definer functions to avoid recursion
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

-- Create new, secure RLS policies for user_roles
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_admin_safe(auth.uid()));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Update existing functions to include proper search_path
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

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'yeildsocials@gmail.com'
  );
$$;

-- Update all other functions to include search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile entry with better error handling
  INSERT INTO public.profiles (id, email, name, referral_code)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    generate_referral_code()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    referral_code = COALESCE(profiles.referral_code, generate_referral_code());

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

-- Add security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(user_id_param uuid, event_type text, event_details jsonb DEFAULT '{}'::jsonb)
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