
-- Create a table for admin notifications
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  message text NOT NULL,
  link_to text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security to ensure only admins can see notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can access notifications"
ON public.admin_notifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable real-time updates on the new notifications table
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Update the function that handles new brand applications to also create an admin notification
CREATE OR REPLACE FUNCTION public.handle_new_brand_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_data jsonb;
  company_name_text text;
BEGIN
  -- Check if brand_application_data exists in the new user's metadata
  IF NEW.raw_user_meta_data ? 'brand_application_data' THEN
    application_data := NEW.raw_user_meta_data -> 'brand_application_data';
    company_name_text := application_data ->> 'companyName';

    -- Insert the application data into the brand_applications table
    INSERT INTO public.brand_applications (
      user_id,
      company_name,
      website,
      company_size,
      industry,
      task_types,
      budget,
      goals
    )
    VALUES (
      NEW.id,
      company_name_text,
      application_data ->> 'website',
      application_data ->> 'companySize',
      application_data ->> 'industry',
      application_data -> 'taskTypes',
      application_data ->> 'budget',
      application_data ->> 'goals'
    );

    -- Insert a notification for admins
    INSERT INTO public.admin_notifications (type, message, link_to)
    VALUES ('new_brand_application', 'New brand application from ' || company_name_text, '/admin?section=brands');

  END IF;
  
  RETURN NEW;
END;
$$;

-- Enable real-time updates on the brand applications table
ALTER TABLE public.brand_applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_applications;
