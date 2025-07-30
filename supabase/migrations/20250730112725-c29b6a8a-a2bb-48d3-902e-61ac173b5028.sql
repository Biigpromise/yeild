-- Fix security issues for generate_reset_code function
CREATE OR REPLACE FUNCTION public.generate_reset_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-digit code
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if it exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM public.password_reset_tokens 
      WHERE reset_code = code 
      AND expires_at > now()
    ) INTO exists_check;
    
    -- If it doesn't exist or is expired, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;