-- Phase 1: Critical Database Security Fixes
-- Fix database functions missing search_path security

-- Update existing functions to include proper search_path
CREATE OR REPLACE FUNCTION public.handle_referral_signup(new_user_id uuid, referral_code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Find the referrer by referral code
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF FOUND THEN
    -- Create the referral record
    INSERT INTO user_referrals (referrer_id, referred_id, referral_code)
    VALUES (referrer_id, new_user_id, referral_code_param)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_referral_signup_improved(new_user_id uuid, referral_code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Find the referrer by referral code
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF FOUND THEN
    -- Create the referral record
    INSERT INTO user_referrals (referrer_id, referred_id, referral_code)
    VALUES (referrer_id, new_user_id, referral_code_param)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    -- Update total referrals count
    UPDATE profiles 
    SET total_referrals_count = total_referrals_count + 1
    WHERE id = referrer_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.credit_user_account(user_id uuid, amount numeric, reference text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update user points/balance
  UPDATE profiles
  SET points = points + amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Record transaction
  INSERT INTO point_transactions (
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
$$;

-- Create enhanced admin verification function with proper security
CREATE OR REPLACE FUNCTION public.verify_admin_access_secure(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  admin_count INTEGER;
BEGIN
  -- Security check: Limit admin creation to prevent abuse
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin';
  
  -- Allow only if no admins exist (initial setup) or if called by existing admin
  IF admin_count > 0 AND NOT is_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only existing admins can create new admins';
  END IF;
  
  -- Check if user exists
  SELECT u.id, u.email INTO user_record 
  FROM auth.users u 
  WHERE u.email = user_email AND u.email_confirmed_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO user_roles (user_id, role)
  VALUES (user_record.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the admin creation for audit trail
  PERFORM log_security_event(
    user_record.id,
    'admin_role_granted',
    jsonb_build_object(
      'granted_by', auth.uid(),
      'granted_to_email', user_email,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- Enhanced security event logging with better structure
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_id_param uuid, 
  event_type text, 
  event_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO user_activity_logs (
    user_id, 
    activity_type, 
    activity_data,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    user_id_param,
    'security_event',
    jsonb_build_object(
      'event_type', event_type,
      'details', event_details,
      'timestamp', now(),
      'session_id', current_setting('request.jwt.claim.session_id', true)
    ),
    inet_client_addr()::text,
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  );
END;
$$;

-- Create secure role checking function
CREATE OR REPLACE FUNCTION public.check_user_role_secure(check_user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id AND role = required_role
  );
$$;