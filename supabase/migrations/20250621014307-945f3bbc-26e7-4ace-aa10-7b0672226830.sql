
-- Fix the infinite recursion issue in user_roles policies
DROP POLICY IF EXISTS "Enable read access for users to view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles" ON public.user_roles
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roles" ON public.user_roles
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow service role full access for admin operations
CREATE POLICY "Service role full access" ON public.user_roles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create admin access policy using email check directly
CREATE POLICY "Admin email access" ON public.user_roles
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'yeildsocials@gmail.com'
    )
  );

-- Create a simple function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'yeildsocials@gmail.com'
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, service_role;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin_user());

-- Create policy for inserting notifications (admin only)
CREATE POLICY "Admin can create notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (public.is_admin_user());
