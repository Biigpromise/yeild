-- Delete the sample tasks I created today
DELETE FROM tasks 
WHERE id IN (
  '30123a52-15df-41c6-bf6d-dfe5fb9fa15a',
  'afa66adc-a983-4771-8b10-4a480c084eed', 
  '77548448-5e36-4e25-b1a1-177836900253'
);

-- Update the auto_convert_campaign_to_tasks function to properly transfer social links
CREATE OR REPLACE FUNCTION public.auto_convert_campaign_to_tasks(p_campaign_id uuid, p_admin_id uuid, p_task_data jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(task_id uuid, success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Create the task with proper social media links transfer
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
    status,
    social_media_links
  ) VALUES (
    task_title,
    task_description,
    COALESCE(p_task_data->>'category', 'Social Media'),
    default_points,
    COALESCE(p_task_data->>'estimated_time', '30 minutes'),
    COALESCE(p_task_data->>'difficulty', 'easy'),
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
    'active',
    campaign_record.social_links  -- Transfer social links from campaign to task
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
$function$;