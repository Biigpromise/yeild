-- Fix missing brand wallet by creating one for the existing user
INSERT INTO brand_wallets (brand_id, balance, total_deposited, total_spent)
VALUES ('6f9b8376-558f-472a-9a2b-1c2520bdfce7', 0.00, 0.00, 0.00)
ON CONFLICT (brand_id) DO NOTHING;

-- Ensure the create_brand_wallet function properly handles new brand users
CREATE OR REPLACE FUNCTION public.create_brand_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is a brand user by checking user_roles or brand_profiles
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'brand'
  ) OR EXISTS (
    SELECT 1 FROM public.brand_profiles 
    WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.brand_wallets (brand_id, balance, total_deposited, total_spent)
    VALUES (NEW.id, 0.00, 0.00, 0.00)
    ON CONFLICT (brand_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;