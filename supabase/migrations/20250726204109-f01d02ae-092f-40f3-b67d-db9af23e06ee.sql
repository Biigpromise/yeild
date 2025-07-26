-- Address remaining security linter issues
-- Fix functions missing search_path protection

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_user_role_secure(check_user_id uuid, required_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_chat_posting_eligibility(user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    COALESCE(p.tasks_completed, 0) >= 1 AND 
    COALESCE(p.active_referrals_count, 0) >= 3
  FROM profiles p
  WHERE p.id = user_id_param;
$function$;

-- Create comprehensive audit logging for security events
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now(),
  severity text DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS on audit logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs" ON security_audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON security_audit_logs
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Enhanced security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  user_id_param uuid, 
  event_type text, 
  event_details jsonb DEFAULT '{}',
  severity_param text DEFAULT 'info'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO security_audit_logs (
    user_id, 
    event_type, 
    event_details,
    ip_address,
    user_agent,
    timestamp,
    severity
  ) VALUES (
    user_id_param,
    event_type,
    event_details,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    now(),
    severity_param
  );
END;
$function$;