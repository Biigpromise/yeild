-- Remove all admin roles except yeildsocials@gmail.com
DELETE FROM public.user_roles 
WHERE role = 'admin' 
AND user_id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email != 'yeildsocials@gmail.com'
);