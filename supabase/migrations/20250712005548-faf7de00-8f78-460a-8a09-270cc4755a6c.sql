-- Create the missing generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := 'REF' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 5));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;