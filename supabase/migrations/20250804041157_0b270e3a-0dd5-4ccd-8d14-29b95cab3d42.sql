-- Fix the user role query issue by ensuring only one role per user
-- First, let's clean up any duplicate user roles (without created_at column)
WITH ranked_roles AS (
  SELECT 
    user_id, 
    role,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY role) as rn
  FROM user_roles
),
duplicates AS (
  SELECT user_id, role 
  FROM ranked_roles 
  WHERE rn > 1
)
DELETE FROM user_roles 
WHERE (user_id, role) IN (SELECT user_id, role FROM duplicates);

-- Update the get_user_role_safe function to handle multiple roles more gracefully
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id_param uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_id_param 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'brand' THEN 2 
      WHEN 'user' THEN 3 
      ELSE 4 
    END
  LIMIT 1;
$function$;