
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create a security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role_for_policy(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- Create new policies that avoid recursion
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- For admin operations, we'll use a different approach that doesn't cause recursion
CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_for_policy(uuid) TO authenticated;
