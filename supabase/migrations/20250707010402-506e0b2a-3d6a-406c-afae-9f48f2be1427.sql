-- Now assign brand role to yeildsocials@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'brand'::public.app_role
FROM auth.users au
WHERE au.email = 'yeildsocials@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'brand'
  );