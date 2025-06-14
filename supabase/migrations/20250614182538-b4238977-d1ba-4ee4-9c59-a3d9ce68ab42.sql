
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

-- Create a simple policy that allows users to insert their own roles
CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to update their own roles (for self-assignment)
CREATE POLICY "Users can update own roles" ON public.user_roles
  FOR UPDATE 
  USING (auth.uid() = user_id);
