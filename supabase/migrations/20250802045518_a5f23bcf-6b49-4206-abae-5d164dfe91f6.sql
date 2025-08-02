-- Fix RLS policies for admin access to all required tables

-- Allow admins to read task_submissions
CREATE POLICY "Admins can view all task submissions" 
ON public.task_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update task_submissions
CREATE POLICY "Admins can update task submissions" 
ON public.task_submissions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to read all brand_campaigns (this should already exist but let's ensure)
DROP POLICY IF EXISTS "Admins can view all brand campaigns" ON public.brand_campaigns;
CREATE POLICY "Admins can view all brand campaigns" 
ON public.brand_campaigns 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update brand_campaigns  
DROP POLICY IF EXISTS "Admins can update all brand campaigns" ON public.brand_campaigns;
CREATE POLICY "Admins can update all brand campaigns" 
ON public.brand_campaigns 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete brand_campaigns
DROP POLICY IF EXISTS "Admins can delete all brand campaigns" ON public.brand_campaigns;
CREATE POLICY "Admins can delete all brand campaigns" 
ON public.brand_campaigns 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Fix Google OAuth redirect URL and ensure proper admin role assignment
-- This will help resolve authentication issues