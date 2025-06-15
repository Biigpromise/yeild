
-- First, let's drop the existing problematic policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create new, non-recursive policies for user_roles table
CREATE POLICY "Enable read access for users to their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for service role"
ON public.user_roles
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Enable insert for service role and authenticated users"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "Enable update for service role"
ON public.user_roles
FOR UPDATE
USING (auth.role() = 'service_role');

-- Also add RLS policies for admin_notifications table if missing
CREATE POLICY "Enable read access for service role on admin_notifications"
ON public.admin_notifications
FOR ALL
USING (auth.role() = 'service_role');

-- Add RLS policies for brand_applications table if missing
CREATE POLICY "Enable read access for service role on brand_applications"
ON public.brand_applications
FOR ALL
USING (auth.role() = 'service_role');
