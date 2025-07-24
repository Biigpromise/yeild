-- Update existing brand user to have proper role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'brand'
FROM auth.users 
WHERE email = 'bigibrand2@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'brand'
  );