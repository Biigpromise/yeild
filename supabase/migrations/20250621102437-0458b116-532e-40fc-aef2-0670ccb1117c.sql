
-- Create missing tables for enhanced task management

-- Add social_media_links column to tasks table if it doesn't exist
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS social_media_links jsonb DEFAULT '{}'::jsonb;

-- Create task templates table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create task analytics table for better performance tracking
CREATE TABLE IF NOT EXISTS public.task_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  total_tasks integer DEFAULT 0,
  active_tasks integer DEFAULT 0,
  pending_submissions integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  approval_rate numeric(5,2) DEFAULT 0.00,
  avg_completion_time integer DEFAULT 0, -- in hours
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create scheduled tasks table
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  scheduled_for timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, published, cancelled
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_templates
CREATE POLICY "Admin can manage task templates" ON public.task_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for task_analytics
CREATE POLICY "Admin can view task analytics" ON public.task_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for scheduled_tasks
CREATE POLICY "Admin can manage scheduled tasks" ON public.scheduled_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_analytics_date ON public.task_analytics(date);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_for ON public.scheduled_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON public.scheduled_tasks(status);

-- Create function to update task analytics daily
CREATE OR REPLACE FUNCTION public.update_daily_task_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  analytics_data RECORD;
BEGIN
  -- Calculate analytics for the target date
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
    (SELECT COUNT(*) FROM task_submissions WHERE DATE(submitted_at) = target_date AND status = 'pending') as pending_submissions,
    (SELECT COUNT(*) FROM task_submissions WHERE DATE(submitted_at) = target_date AND status = 'approved') as completed_tasks,
    CASE 
      WHEN (SELECT COUNT(*) FROM task_submissions WHERE DATE(submitted_at) = target_date) > 0 
      THEN ROUND(
        ((SELECT COUNT(*) FROM task_submissions WHERE DATE(submitted_at) = target_date AND status = 'approved')::numeric / 
         (SELECT COUNT(*) FROM task_submissions WHERE DATE(submitted_at) = target_date)::numeric) * 100, 2
      )
      ELSE 0.00
    END as approval_rate
  INTO analytics_data
  FROM tasks 
  WHERE DATE(created_at) <= target_date;

  -- Insert or update analytics record
  INSERT INTO task_analytics (date, total_tasks, active_tasks, pending_submissions, completed_tasks, approval_rate, avg_completion_time)
  VALUES (target_date, analytics_data.total_tasks, analytics_data.active_tasks, analytics_data.pending_submissions, analytics_data.completed_tasks, analytics_data.approval_rate, 24)
  ON CONFLICT (date) 
  DO UPDATE SET 
    total_tasks = EXCLUDED.total_tasks,
    active_tasks = EXCLUDED.active_tasks,
    pending_submissions = EXCLUDED.pending_submissions,
    completed_tasks = EXCLUDED.completed_tasks,
    approval_rate = EXCLUDED.approval_rate,
    avg_completion_time = EXCLUDED.avg_completion_time;
END;
$$;
