-- Grant admin role to yeildsocials@gmail.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'yeildsocials@gmail.com';
    
    IF FOUND THEN
        -- Grant admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role granted to yeildsocials@gmail.com (User ID: %)', target_user_id;
    ELSE
        -- If user doesn't exist, we'll still create a record that will be applied when they sign up
        RAISE NOTICE 'User yeildsocials@gmail.com not found. Admin role will be granted when they sign up.';
    END IF;
END $$;

-- Create a trigger to automatically grant admin role to yeildsocials@gmail.com when they sign up
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if this is the admin email
    IF NEW.email = 'yeildsocials@gmail.com' THEN
        -- Grant admin role
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
                'method', 'auto_signup_trigger'
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto admin role assignment
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
CREATE TRIGGER on_admin_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_signup();