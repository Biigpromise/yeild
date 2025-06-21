
-- Add referral tracking columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_referrals_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referrals_count integer DEFAULT 0;

-- Create function to update referral counts
CREATE OR REPLACE FUNCTION public.update_referral_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referrer's counts when a referral is activated/deactivated
  IF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    IF NEW.is_active = true THEN
      -- Referral was activated
      UPDATE public.profiles 
      SET active_referrals_count = active_referrals_count + 1
      WHERE id = NEW.referrer_id;
    ELSE
      -- Referral was deactivated
      UPDATE public.profiles 
      SET active_referrals_count = GREATEST(0, active_referrals_count - 1)
      WHERE id = NEW.referrer_id;
    END IF;
  END IF;
  
  -- Update total referrals count on insert
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET total_referrals_count = total_referrals_count + 1
    WHERE id = NEW.referrer_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for referral count updates
DROP TRIGGER IF EXISTS update_referral_counts_trigger ON public.user_referrals;
CREATE TRIGGER update_referral_counts_trigger
  AFTER INSERT OR UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_counts();

-- Initialize existing referral counts
UPDATE public.profiles 
SET 
  active_referrals_count = (
    SELECT COUNT(*) 
    FROM public.user_referrals 
    WHERE referrer_id = profiles.id AND is_active = true
  ),
  total_referrals_count = (
    SELECT COUNT(*) 
    FROM public.user_referrals 
    WHERE referrer_id = profiles.id
  );

-- Create admin verification function
CREATE OR REPLACE FUNCTION public.verify_single_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists and assign admin role if they don't have it
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email
  ) THEN
    -- Get the user ID
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'admin'
    FROM auth.users au
    WHERE au.email = user_email
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = au.id AND ur.role = 'admin'
      );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
