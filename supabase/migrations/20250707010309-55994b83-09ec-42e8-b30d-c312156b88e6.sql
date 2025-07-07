-- First, let's see what roles are currently allowed and add 'brand' if needed
DO $$
BEGIN
    -- Add 'brand' to the app_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'brand' AND enumtypid = 'public.app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'brand';
    END IF;
END $$;

-- Now assign brand role to yeildsocials@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'brand'::public.app_role
FROM auth.users au
WHERE au.email = 'yeildsocials@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'brand'
  );