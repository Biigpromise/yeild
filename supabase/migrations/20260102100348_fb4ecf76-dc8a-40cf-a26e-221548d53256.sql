-- Function to add a role to a user if they don't already have it
CREATE OR REPLACE FUNCTION public.add_user_role_if_not_exists(
  p_user_id UUID,
  p_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;