-- Fix the get_admin_task_submissions function to handle evidence as text, not jsonb
DROP FUNCTION IF EXISTS get_admin_task_submissions(integer);

CREATE OR REPLACE FUNCTION get_admin_task_submissions(limit_count integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  task_id uuid,
  status text,
  evidence text,  -- Changed from jsonb to text
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewer_id uuid,
  rejection_reason text,
  social_media_handle text,
  evidence_file_url text,
  user_name text,
  user_email text,
  task_title text,
  task_description text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.user_id,
    ts.task_id,
    ts.status,
    ts.evidence,  -- Removed ::jsonb cast since evidence is text
    ts.submitted_at,
    ts.reviewed_at,
    ts.reviewed_by as reviewer_id,
    ts.rejection_reason,
    ''::text as social_media_handle,
    ts.evidence_file_url,
    p.name as user_name,
    p.email as user_email,
    t.title as task_title,
    t.description as task_description
  FROM task_submissions ts
  LEFT JOIN profiles p ON ts.user_id = p.id
  LEFT JOIN tasks t ON ts.task_id = t.id
  ORDER BY ts.submitted_at DESC
  LIMIT limit_count;
END;
$$;