
-- Update `assign_brand_role_on_approval` to specify the search_path immutably and safely

CREATE OR REPLACE FUNCTION public.assign_brand_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the application status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Assign the 'brand' role to the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'brand')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;
