
-- Enable Row Level Security on the tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts before creating new ones
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view active tasks" ON public.tasks;

-- Create a policy to allow admins to perform any action on tasks
CREATE POLICY "Admins can manage all tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a policy for users to view only active tasks
CREATE POLICY "Authenticated users can view active tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (status = 'active');
