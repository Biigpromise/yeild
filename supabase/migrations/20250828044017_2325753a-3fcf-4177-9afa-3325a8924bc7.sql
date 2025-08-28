-- Update admin auto-signin for yeildsocials@gmail.com
-- This function will automatically assign admin role to the specific email
CREATE OR REPLACE FUNCTION public.handle_admin_auto_signin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is the specific admin email
  IF NEW.email = 'yeildsocials@gmail.com' THEN
    -- Assign admin role immediately
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the admin auto-signin
    PERFORM log_security_event(
      NEW.id,
      'admin_auto_signin',
      jsonb_build_object(
        'email', NEW.email,
        'timestamp', now(),
        'method', 'auto_signin_trigger'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin auto-signin on auth.users table
DROP TRIGGER IF EXISTS trigger_admin_auto_signin ON auth.users;
CREATE TRIGGER trigger_admin_auto_signin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_auto_signin();