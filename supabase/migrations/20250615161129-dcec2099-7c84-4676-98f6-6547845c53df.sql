
-- Step 1: Create a helper function to check if a user is an admin (SECURITY DEFINER avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- Step 2: Grant permission for authenticated users, service_role to use the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

-- Step 3: Add a policy to allow admins to select all rows from profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- (Optional, for completeness) Allow users to see their own profile (if not already set elsewhere)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());
