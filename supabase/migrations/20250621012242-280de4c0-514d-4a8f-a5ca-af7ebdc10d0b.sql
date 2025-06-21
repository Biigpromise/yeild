
-- Fix the infinite recursion issue in user_roles policies
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create a simple, non-recursive policy structure
CREATE POLICY "Enable read access for users to view own roles" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow service role full access for admin operations
CREATE POLICY "Service role full access" ON public.user_roles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant admin access specifically to yeildsocials@gmail.com
-- First, find and assign admin role to this email
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user ID for yeildsocials@gmail.com
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'yeildsocials@gmail.com';
  
  -- If user exists, grant admin role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
