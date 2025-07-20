-- Fix referral code generation for existing users without codes
UPDATE public.profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Ensure referral code is generated for all future users
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate referral code if not present
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to ensure referral code generation
DROP TRIGGER IF EXISTS ensure_referral_code_trigger ON public.profiles;
CREATE TRIGGER ensure_referral_code_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_referral_code();