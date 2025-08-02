-- Ensure admins can view all task submissions with evidence
DROP POLICY IF EXISTS "Admins can view all task submissions with evidence" ON task_submissions;

CREATE POLICY "Admins can view all task submissions with evidence"
ON task_submissions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Ensure admins can update task submission status  
DROP POLICY IF EXISTS "Admins can update task submission status" ON task_submissions;

CREATE POLICY "Admins can update task submission status"
ON task_submissions 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create a function to get task submissions with evidence for admins
CREATE OR REPLACE FUNCTION get_admin_task_submissions(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  task_id UUID,
  status TEXT,
  evidence JSONB,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  task_title TEXT,
  task_points INTEGER,
  user_name TEXT,
  user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ts.id,
    ts.user_id,
    ts.task_id,
    ts.status,
    ts.evidence,
    ts.submitted_at,
    ts.reviewed_at,
    ts.rejection_reason,
    t.title as task_title,
    t.points as task_points,
    p.name as user_name,
    p.email as user_email
  FROM task_submissions ts
  LEFT JOIN tasks t ON ts.task_id = t.id
  LEFT JOIN profiles p ON ts.user_id = p.id
  ORDER BY ts.submitted_at DESC
  LIMIT limit_count;
END;
$$;