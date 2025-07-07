-- Fix infinite recursion in user_roles policies by creating security definer functions
-- and updating the problematic policies

-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id_param uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_id_param 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param AND role = 'admin'
  );
$$;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_admin_safe(auth.uid()))
WITH CHECK (is_admin_safe(auth.uid()));

CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

-- Update other functions that might be causing issues
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