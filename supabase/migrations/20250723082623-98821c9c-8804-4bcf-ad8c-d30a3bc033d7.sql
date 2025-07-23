-- Ensure admin role exists for the designated user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'yeildsocials@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;