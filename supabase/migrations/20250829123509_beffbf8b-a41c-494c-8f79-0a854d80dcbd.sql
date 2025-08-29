-- Fix the handle_admin_signup trigger to work properly with email confirmation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle admin role assignment more reliably
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if this is the specific admin email
    IF NEW.email = 'yeildsocials@gmail.com' THEN
        -- Assign admin role immediately (whether email is confirmed or not)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Log the admin creation for audit trail
        PERFORM log_security_event(
            NEW.id,
            'admin_role_auto_granted',
            jsonb_build_object(
                'email', NEW.email,
                'granted_at', now(),
                'method', 'auto_signup_trigger',
                'email_confirmed', NEW.email_confirmed_at IS NOT NULL
            )
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_admin_signup();