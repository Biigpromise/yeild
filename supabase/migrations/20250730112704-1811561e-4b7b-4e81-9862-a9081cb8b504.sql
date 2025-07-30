-- Update password_reset_tokens table for code-based reset
ALTER TABLE public.password_reset_tokens 
ADD COLUMN IF NOT EXISTS reset_code TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Update expires_at default to 10 minutes from now for codes
ALTER TABLE public.password_reset_tokens 
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '10 minutes');

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_code ON public.password_reset_tokens(reset_code) WHERE reset_code IS NOT NULL;

-- Create function to generate 6-digit codes
CREATE OR REPLACE FUNCTION public.generate_reset_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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