-- Ensure yeildsocials@gmail.com has admin role in user_roles table
-- This will assign admin role to the user if they exist and don't already have it

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'
FROM auth.users au
WHERE au.email = 'yeildsocials@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'admin'
  );

-- Log this assignment for audit trail
INSERT INTO public.user_activity_logs (user_id, activity_type, activity_data)
SELECT au.id, 'admin_role_assigned', 
       jsonb_build_object(
         'assigned_by', 'system_migration',
         'email', au.email,
         'timestamp', now(),
         'reason', 'Initial admin setup'
       )
FROM auth.users au
WHERE au.email = 'yeildsocials@gmail.com';