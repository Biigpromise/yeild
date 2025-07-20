-- Fix security issues for functions with mutable search_path

-- Fix calculate_referral_points function
CREATE OR REPLACE FUNCTION public.calculate_referral_points(referrer_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_referral_count INTEGER;
  points INTEGER;
BEGIN
  -- Count active referrals
  SELECT COUNT(*) INTO active_referral_count
  FROM user_referrals
  WHERE referrer_id = calculate_referral_points.referrer_id AND is_active = true;
  
  -- Tiered point system
  IF active_referral_count < 5 THEN
    points := 10; -- First 5 referrals: 10 points each
  ELSIF active_referral_count < 15 THEN
    points := 20; -- Next 10 referrals: 20 points each
  ELSE
    points := 30; -- After 15 referrals: 30 points each
  END IF;
  
  RETURN points;
END;
$function$;

-- Fix handle_brand_signup function
CREATE OR REPLACE FUNCTION public.handle_brand_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is a brand user type
  IF NEW.raw_user_meta_data->>'user_type' = 'brand' THEN
    -- Call edge function to send brand confirmation email
    PERFORM 
      net.http_post(
        url := 'https://stehjqdbncykevpokcvj.supabase.co/functions/v1/send-brand-confirmation-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
        body := json_build_object(
          'email', NEW.email,
          'name', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
          'confirmationLink', 'https://stehjqdbncykevpokcvj.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || 'https://your-domain.com/brand-dashboard'
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix credit_user_account function
CREATE OR REPLACE FUNCTION public.credit_user_account(user_id uuid, amount numeric, reference text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update user points/balance
  UPDATE public.profiles
  SET points = points + amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Record transaction
  INSERT INTO public.point_transactions (
    user_id,
    points,
    transaction_type,
    description,
    reference_id
  ) VALUES (
    user_id,
    amount,
    'payment_credit',
    'Payment credited: ' || reference,
    gen_random_uuid()
  );
END;
$function$;