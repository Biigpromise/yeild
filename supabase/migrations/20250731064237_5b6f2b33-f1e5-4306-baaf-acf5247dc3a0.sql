-- Add admin role for the current user (janebahago10@gmail.com)
INSERT INTO user_roles (user_id, role, assigned_by) 
VALUES ('44e08509-75c3-4b5f-8a43-133b7a71a228', 'admin', '44e08509-75c3-4b5f-8a43-133b7a71a228')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add comprehensive admin policies for task_submissions to ensure admins can see all submissions
DROP POLICY IF EXISTS "Admins can view all task submissions" ON task_submissions;
CREATE POLICY "Admins can view all task submissions" 
ON task_submissions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- Ensure admin can manage all task submissions (combined policy)
DROP POLICY IF EXISTS "Admins can manage all task submissions" ON task_submissions;
CREATE POLICY "Admins can manage all task submissions" 
ON task_submissions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
);