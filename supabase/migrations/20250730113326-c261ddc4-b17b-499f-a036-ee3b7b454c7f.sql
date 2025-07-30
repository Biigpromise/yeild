-- Fix security definer view issue for performance_monitor
-- First, let's see what the view contains by dropping and recreating it properly
DROP VIEW IF EXISTS public.performance_monitor;

-- Create a secure function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_performance_metrics()
RETURNS TABLE(
  metric_name TEXT,
  metric_value NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to access performance metrics
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    'active_users_24h'::TEXT as metric_name,
    COUNT(DISTINCT user_id)::NUMERIC as metric_value,
    NOW() as recorded_at
  FROM user_activity_logs 
  WHERE created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'total_tasks_completed'::TEXT as metric_name,
    COUNT(*)::NUMERIC as metric_value,
    NOW() as recorded_at
  FROM task_submissions 
  WHERE status = 'approved'
  
  UNION ALL
  
  SELECT 
    'total_points_awarded'::TEXT as metric_name,
    COALESCE(SUM(points), 0)::NUMERIC as metric_value,
    NOW() as recorded_at
  FROM point_transactions
  WHERE transaction_type IN ('task_completion', 'referral_bonus');
END;
$$;