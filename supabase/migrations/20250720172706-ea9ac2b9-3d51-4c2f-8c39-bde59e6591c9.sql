-- Fix security issues identified by linter

-- 1. Add RLS policies for colors table (READ-ONLY for everyone)
CREATE POLICY "Everyone can view colors" ON public.colors
FOR SELECT 
USING (true);

-- 2. Add RLS policies for withdrawal_settings table
CREATE POLICY "Users can view their own withdrawal settings" ON public.withdrawal_settings
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal settings" ON public.withdrawal_settings
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own withdrawal settings" ON public.withdrawal_settings
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal settings" ON public.withdrawal_settings
FOR ALL 
USING (has_role(auth.uid(), 'admin'::text));

-- 3. Fix function security by setting search_path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 4. Create secure password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Password must be at least 8 characters
  IF LENGTH(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Password must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Password must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Password must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 5. Create secure session management function
CREATE OR REPLACE FUNCTION public.create_secure_session(user_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_id uuid;
BEGIN
  -- Generate secure session ID
  session_id := gen_random_uuid();
  
  -- Insert session record
  INSERT INTO public.user_sessions (id, user_id, created_at, expires_at, is_active)
  VALUES (
    session_id, 
    user_id_param, 
    now(), 
    now() + interval '24 hours',
    true
  );
  
  RETURN session_id;
END;
$function$;

-- 6. Create rate limiting function for security
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id_param uuid, action_type text, max_attempts integer DEFAULT 5, time_window interval DEFAULT '1 hour')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.user_activity_logs
  WHERE user_id = user_id_param 
    AND activity_type = action_type
    AND created_at > now() - time_window;
  
  -- Return false if rate limit exceeded
  IF attempt_count >= max_attempts THEN
    RETURN false;
  END IF;
  
  -- Log this attempt
  INSERT INTO public.user_activity_logs (user_id, activity_type, activity_data)
  VALUES (user_id_param, action_type, jsonb_build_object('timestamp', now()));
  
  RETURN true;
END;
$function$;