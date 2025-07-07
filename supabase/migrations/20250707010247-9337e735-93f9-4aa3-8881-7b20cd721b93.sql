-- Fix the user_roles RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'yeildsocials@gmail.com'
  )
);

-- Create function to assign brand role to specific email
CREATE OR REPLACE FUNCTION public.assign_brand_role_to_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user exists and assign brand role
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email
  ) THEN
    -- Insert brand role for the user
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'brand'
    FROM auth.users au
    WHERE au.email = user_email
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = au.id AND ur.role = 'brand'
      );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Assign brand role to yeildsocials@gmail.com
SELECT public.assign_brand_role_to_email('yeildsocials@gmail.com');