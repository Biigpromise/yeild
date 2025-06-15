
-- This function will be triggered when a new user signs up.
-- It securely creates a brand application using the data provided during signup.
CREATE OR REPLACE FUNCTION public.handle_new_brand_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_data jsonb;
BEGIN
  -- Check if brand_application_data exists in the new user's metadata
  IF NEW.raw_user_meta_data ? 'brand_application_data' THEN
    application_data := NEW.raw_user_meta_data -> 'brand_application_data';

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
      application_data ->> 'companyName',
      application_data ->> 'website',
      application_data ->> 'companySize',
      application_data ->> 'industry',
      application_data -> 'taskTypes',
      application_data ->> 'budget',
      application_data ->> 'goals'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- This trigger will execute the handle_new_brand_application function
-- every time a new user is created.
CREATE TRIGGER on_auth_user_created_create_brand_application
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_brand_application();
