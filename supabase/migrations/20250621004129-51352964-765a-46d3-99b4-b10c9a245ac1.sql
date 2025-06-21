
-- Create table for storing user device fingerprints and signup data
CREATE TABLE IF NOT EXISTS public.user_signup_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  device_fingerprint TEXT,
  user_agent TEXT,
  signup_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location_country TEXT,
  location_city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for fraud flags
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_type TEXT NOT NULL, -- 'duplicate_referral', 'location_abuse', 'behavior_ratio', etc.
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- for referral fraud
  flag_reason TEXT NOT NULL,
  evidence JSONB, -- store additional evidence data
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_signup_data_ip ON public.user_signup_data(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_signup_data_fingerprint ON public.user_signup_data(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_signup_data_user_id ON public.user_signup_data(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_type ON public.fraud_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON public.fraud_flags(status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_user_id ON public.fraud_flags(user_id);

-- Enable RLS
ALTER TABLE public.user_signup_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_signup_data (users can see their own, admins see all)
CREATE POLICY "Users can view their own signup data"
  ON public.user_signup_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all signup data"
  ON public.user_signup_data FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service can insert signup data"
  ON public.user_signup_data FOR INSERT
  WITH CHECK (true);

-- RLS policies for fraud_flags (admins only)
CREATE POLICY "Admins can view fraud flags"
  ON public.fraud_flags FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service can insert fraud flags"
  ON public.fraud_flags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update fraud flags"
  ON public.fraud_flags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Function to detect duplicate referral fraud
CREATE OR REPLACE FUNCTION public.detect_referral_fraud()
RETURNS TRIGGER AS $$
DECLARE
  referrer_signup_data RECORD;
  referred_signup_data RECORD;
  duplicate_count INTEGER;
BEGIN
  -- Get signup data for both referrer and referred user
  SELECT * INTO referrer_signup_data 
  FROM public.user_signup_data 
  WHERE user_id = NEW.referrer_id;
  
  SELECT * INTO referred_signup_data 
  FROM public.user_signup_data 
  WHERE user_id = NEW.referred_id;
  
  -- Check if both records exist
  IF referrer_signup_data IS NOT NULL AND referred_signup_data IS NOT NULL THEN
    -- Check for same IP address
    IF referrer_signup_data.ip_address = referred_signup_data.ip_address THEN
      INSERT INTO public.fraud_flags (
        flag_type, user_id, related_user_id, flag_reason, evidence, severity
      ) VALUES (
        'duplicate_referral',
        NEW.referrer_id,
        NEW.referred_id,
        'Same IP address detected for referrer and referred user',
        jsonb_build_object(
          'referrer_ip', referrer_signup_data.ip_address,
          'referred_ip', referred_signup_data.ip_address,
          'referrer_signup', referrer_signup_data.signup_timestamp,
          'referred_signup', referred_signup_data.signup_timestamp
        ),
        'high'
      );
    END IF;
    
    -- Check for same device fingerprint
    IF referrer_signup_data.device_fingerprint = referred_signup_data.device_fingerprint 
       AND referrer_signup_data.device_fingerprint IS NOT NULL THEN
      INSERT INTO public.fraud_flags (
        flag_type, user_id, related_user_id, flag_reason, evidence, severity
      ) VALUES (
        'duplicate_referral',
        NEW.referrer_id,
        NEW.referred_id,
        'Same device fingerprint detected for referrer and referred user',
        jsonb_build_object(
          'device_fingerprint', referrer_signup_data.device_fingerprint,
          'referrer_signup', referrer_signup_data.signup_timestamp,
          'referred_signup', referred_signup_data.signup_timestamp
        ),
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to detect referral fraud when new referral is created
CREATE TRIGGER detect_referral_fraud_trigger
  AFTER INSERT ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_referral_fraud();
