-- Fix security issue by setting search_path for admin signup trigger
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is yeildsocials@gmail.com
  IF NEW.email = 'yeildsocials@gmail.com' THEN
    -- Insert admin role immediately
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;