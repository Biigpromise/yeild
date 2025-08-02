-- Ensure admin access for testing
-- Find the first user and assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;