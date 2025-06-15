
-- 1. Remove all existing policies on user_roles to avoid recursion issues
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for users to their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for service role" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for service role and authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for service role" ON public.user_roles;

-- 2. (Re-)create a security definer function for reading roles (avoids recursion)
CREATE OR REPLACE FUNCTION public.get_user_role_for_policy(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- 3. Set up policies:
-- Allow users to view, insert, and update their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles" ON public.user_roles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service_role to manage all roles (for edge functions & backend operations)
CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Grant EXECUTE permission on the helper function to all roles that need it
GRANT EXECUTE ON FUNCTION public.get_user_role_for_policy(uuid) TO authenticated, service_role;
