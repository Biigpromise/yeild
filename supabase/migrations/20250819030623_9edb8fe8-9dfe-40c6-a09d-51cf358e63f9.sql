-- Check if admin role exists for yeildsocials@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'yeildsocials@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add for theberekah@gmail.com (current user)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'  
FROM auth.users
WHERE email = 'theberekah@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;