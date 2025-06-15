
-- 1. Remove all potentially conflicting policies on user_roles to ensure a clean slate
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;

-- 2. Create a security definer function for reading roles (to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_role_for_policy(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- 3. Re-create the correct, non-recursive policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles" ON public.user_roles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Allow the service role to access all rows for backend operations
CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Grant EXECUTE permission on the new function
GRANT EXECUTE ON FUNCTION public.get_user_role_for_policy(uuid) TO authenticated, service_role;
