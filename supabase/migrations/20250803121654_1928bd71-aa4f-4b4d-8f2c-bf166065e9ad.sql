-- Phase 1: Database Schema Updates for Hybrid Task Management System

-- Add task source and campaign linking to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_source TEXT DEFAULT 'platform' CHECK (task_source IN ('platform', 'brand_campaign'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source_campaign_id UUID REFERENCES public.brand_campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS original_budget NUMERIC;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS point_adjustment_reason TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS approved_by_admin UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

-- Add conversion tracking to brand_campaigns
ALTER TABLE public.brand_campaigns ADD COLUMN IF NOT EXISTS converted_to_tasks BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_campaigns ADD COLUMN IF NOT EXISTS tasks_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.brand_campaigns ADD COLUMN IF NOT EXISTS tasks_generated_by UUID;
ALTER TABLE public.brand_campaigns ADD COLUMN IF NOT EXISTS auto_convert_enabled BOOLEAN DEFAULT TRUE;

-- Create campaign_task_conversions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.campaign_task_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  original_budget NUMERIC NOT NULL,
  allocated_points INTEGER NOT NULL,
  point_adjustment INTEGER DEFAULT 0,
  adjustment_reason TEXT,
  converted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaign_task_conversions
ALTER TABLE public.campaign_task_conversions ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_task_conversions
CREATE POLICY "Admins can manage campaign task conversions" ON public.campaign_task_conversions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Brands can view conversions for their campaigns" ON public.campaign_task_conversions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.brand_campaigns bc 
    WHERE bc.id = campaign_task_conversions.campaign_id 
    AND bc.brand_id = auth.uid()
  ));

-- Create task_source_analytics table for tracking
CREATE TABLE IF NOT EXISTS public.task_source_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_source TEXT NOT NULL CHECK (task_source IN ('platform', 'brand_campaign')),
  total_tasks INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_budget NUMERIC DEFAULT 0,
  total_points_awarded INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, task_source)
);

-- Enable RLS on task_source_analytics
ALTER TABLE public.task_source_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for task_source_analytics
CREATE POLICY "Admins can manage task source analytics" ON public.task_source_analytics
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create function to auto-convert approved campaigns to tasks
CREATE OR REPLACE FUNCTION public.auto_convert_campaign_to_tasks(
  p_campaign_id UUID,
  p_admin_id UUID,
  p_task_data JSONB DEFAULT NULL
)
RETURNS TABLE(task_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  campaign_record RECORD;
  new_task_id UUID;
  default_points INTEGER;
  task_title TEXT;
  task_description TEXT;
BEGIN
  -- Get campaign details
  SELECT * INTO campaign_record 
  FROM public.brand_campaigns 
  WHERE id = p_campaign_id AND admin_approval_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Campaign not found or not approved';
    RETURN;
  END IF;
  
  -- Check if already converted
  IF campaign_record.converted_to_tasks THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Campaign already converted to tasks';
    RETURN;
  END IF;
  
  -- Calculate default points (can be overridden)
  default_points := COALESCE((p_task_data->>'points')::INTEGER, LEAST(campaign_record.budget::INTEGER, 100));
  
  -- Set task details (can be overridden)
  task_title := COALESCE(p_task_data->>'title', campaign_record.title);
  task_description := COALESCE(p_task_data->>'description', campaign_record.description);
  
  -- Create the task
  INSERT INTO public.tasks (
    title,
    description,
    category,
    points,
    estimated_time,
    difficulty,
    task_type,
    brand_name,
    brand_logo_url,
    brand_user_id,
    task_source,
    source_campaign_id,
    original_budget,
    approved_by_admin,
    status
  ) VALUES (
    task_title,
    task_description,
    COALESCE(p_task_data->>'category', 'Social Media'),
    default_points,
    COALESCE(p_task_data->>'estimated_time', '30 minutes'),
    COALESCE(p_task_data->>'difficulty', 'Medium'),
    'brand_sponsored',
    (SELECT COALESCE(bp.company_name, p.name) FROM public.profiles p 
     LEFT JOIN public.brand_profiles bp ON bp.user_id = p.id 
     WHERE p.id = campaign_record.brand_id),
    campaign_record.logo_url,
    campaign_record.brand_id,
    'brand_campaign',
    p_campaign_id,
    campaign_record.budget,
    p_admin_id,
    'active'
  ) RETURNING id INTO new_task_id;
  
  -- Update campaign as converted
  UPDATE public.brand_campaigns 
  SET 
    converted_to_tasks = TRUE,
    tasks_generated_at = now(),
    tasks_generated_by = p_admin_id,
    updated_at = now()
  WHERE id = p_campaign_id;
  
  -- Record the conversion
  INSERT INTO public.campaign_task_conversions (
    campaign_id,
    task_id,
    original_budget,
    allocated_points,
    converted_by
  ) VALUES (
    p_campaign_id,
    new_task_id,
    campaign_record.budget,
    default_points,
    p_admin_id
  );
  
  RETURN QUERY SELECT new_task_id, TRUE, 'Campaign successfully converted to task';
END;
$$;

-- Create function to update task source analytics
CREATE OR REPLACE FUNCTION public.update_task_source_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  platform_data RECORD;
  brand_data RECORD;
BEGIN
  -- Calculate platform task analytics
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COALESCE(SUM(points), 0) as total_budget,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END), 0) as total_points_awarded
  INTO platform_data
  FROM public.tasks 
  WHERE task_source = 'platform' AND DATE(created_at) <= target_date;
  
  -- Calculate brand campaign task analytics  
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'active') as active_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COALESCE(SUM(original_budget), 0) as total_budget,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END), 0) as total_points_awarded
  INTO brand_data
  FROM public.tasks 
  WHERE task_source = 'brand_campaign' AND DATE(created_at) <= target_date;
  
  -- Insert/update platform analytics
  INSERT INTO public.task_source_analytics (
    date, task_source, total_tasks, active_tasks, completed_tasks, 
    total_budget, total_points_awarded
  ) VALUES (
    target_date, 'platform', platform_data.total_tasks, platform_data.active_tasks,
    platform_data.completed_tasks, platform_data.total_budget, platform_data.total_points_awarded
  ) ON CONFLICT (date, task_source) 
  DO UPDATE SET 
    total_tasks = EXCLUDED.total_tasks,
    active_tasks = EXCLUDED.active_tasks,
    completed_tasks = EXCLUDED.completed_tasks,
    total_budget = EXCLUDED.total_budget,
    total_points_awarded = EXCLUDED.total_points_awarded,
    updated_at = now();
    
  -- Insert/update brand analytics
  INSERT INTO public.task_source_analytics (
    date, task_source, total_tasks, active_tasks, completed_tasks,
    total_budget, total_points_awarded
  ) VALUES (
    target_date, 'brand_campaign', brand_data.total_tasks, brand_data.active_tasks,
    brand_data.completed_tasks, brand_data.total_budget, brand_data.total_points_awarded
  ) ON CONFLICT (date, task_source)
  DO UPDATE SET 
    total_tasks = EXCLUDED.total_tasks,
    active_tasks = EXCLUDED.active_tasks, 
    completed_tasks = EXCLUDED.completed_tasks,
    total_budget = EXCLUDED.total_budget,
    total_points_awarded = EXCLUDED.total_points_awarded,
    updated_at = now();
END;
$$;