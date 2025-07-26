-- Fix database functions security by adding proper search_path settings
-- This prevents potential security vulnerabilities in function execution

CREATE OR REPLACE FUNCTION public.verify_single_admin_access(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_for_policy(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id_param uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_id_param 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Assign default 'user' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;