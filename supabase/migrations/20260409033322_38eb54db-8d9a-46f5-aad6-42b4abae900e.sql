
-- 1. Replace hardcoded admin email triggers with role-based approach
-- Drop the triggers that reference hardcoded email on auth.users
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
DROP TRIGGER IF EXISTS on_admin_auto_signin ON auth.users;

-- Replace handle_admin_signup to use role-based check instead of hardcoded email
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin role assignment is handled via user_roles table and admin panel
  -- No hardcoded email checks - use verify_admin_access_secure() for admin creation
  RETURN NEW;
END;
$function$;

-- Replace handle_admin_auto_signin similarly
CREATE OR REPLACE FUNCTION public.handle_admin_auto_signin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin auto-signin is no longer based on hardcoded email
  -- Admin role is managed via user_roles table
  RETURN NEW;
END;
$function$;

-- 2. Fix profiles INSERT policy - scope to own user only
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
