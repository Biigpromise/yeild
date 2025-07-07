-- Check current constraints on user_roles table
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%user_roles%';

-- Drop the problematic constraint if it exists
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Create a new constraint that includes 'brand'
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'moderator', 'user', 'brand'));