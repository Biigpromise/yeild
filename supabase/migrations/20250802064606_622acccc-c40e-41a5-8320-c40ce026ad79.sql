
-- Create secure admin check function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Update task_submissions RLS policies to allow admin access
DROP POLICY IF EXISTS "Admins can view all task submissions" ON public.task_submissions;
CREATE POLICY "Admins can view all task submissions" 
ON public.task_submissions 
FOR SELECT 
USING (public.is_current_user_admin_secure());

-- Update brand_campaigns RLS policies to allow admin access
DROP POLICY IF EXISTS "Admins can view all brand campaigns" ON public.brand_campaigns;
CREATE POLICY "Admins can view all brand campaigns" 
ON public.brand_campaigns 
FOR SELECT 
USING (public.is_current_user_admin_secure());

-- Update brand_applications RLS policies to allow admin access
DROP POLICY IF EXISTS "Admins can view all brand applications secure" ON public.brand_applications;
CREATE POLICY "Admins can view all brand applications secure" 
ON public.brand_applications 
FOR SELECT 
USING (public.is_current_user_admin_secure());

-- Create admin dashboard stats function
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
  total_task_submissions bigint,
  pending_submissions bigint,
  total_campaigns bigint,
  active_campaigns bigint,
  total_applications bigint,
  pending_applications bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT COUNT(*) FROM task_submissions)::bigint as total_task_submissions,
    (SELECT COUNT(*) FROM task_submissions WHERE status = 'pending')::bigint as pending_submissions,
    (SELECT COUNT(*) FROM brand_campaigns)::bigint as total_campaigns,
    (SELECT COUNT(*) FROM brand_campaigns WHERE status = 'active')::bigint as active_campaigns,
    (SELECT COUNT(*) FROM brand_applications)::bigint as total_applications,
    (SELECT COUNT(*) FROM brand_applications WHERE status = 'pending')::bigint as pending_applications;
$$;
