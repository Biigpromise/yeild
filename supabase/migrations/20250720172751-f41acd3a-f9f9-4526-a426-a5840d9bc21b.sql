-- Fix security issues identified by linter (corrected version)

-- 1. Add RLS policies for colors table (READ-ONLY for everyone)
CREATE POLICY "Everyone can view colors" ON public.colors
FOR SELECT 
USING (true);

-- 2. Add RLS policies for withdrawal_settings table (admin-only configuration)
CREATE POLICY "Admins can view withdrawal settings" ON public.withdrawal_settings
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Admins can manage withdrawal settings" ON public.withdrawal_settings
FOR ALL 
USING (has_role(auth.uid(), 'admin'::text));

-- 3. Fix function security by setting search_path for all security definer functions
-- Update existing functions to have proper search_path
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

-- Fix generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 4. Create additional security functions for input validation
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove potentially dangerous characters and normalize
  RETURN trim(regexp_replace(input_text, '[<>"\''&]', '', 'g'));
END;
$function$;

-- 5. Create audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_id_param uuid,
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;