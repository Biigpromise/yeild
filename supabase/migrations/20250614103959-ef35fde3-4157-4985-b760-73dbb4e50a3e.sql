
-- Create withdrawal_requests table to track user payout requests
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in points
  payout_method TEXT NOT NULL, -- 'paypal', 'bank_transfer', 'crypto'
  payout_details JSONB NOT NULL, -- Store method-specific details (email, account info, etc.)
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to create their own withdrawal requests
CREATE POLICY "Users can create withdrawal requests" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create minimum withdrawal settings table
CREATE TABLE public.withdrawal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minimum_withdrawal_points INTEGER NOT NULL DEFAULT 1000,
  processing_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.0,
  daily_withdrawal_limit INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.withdrawal_settings (minimum_withdrawal_points, processing_fee_percentage, daily_withdrawal_limit)
VALUES (1000, 5.0, 10000);

-- Add trigger to update updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_settings_updated_at
  BEFORE UPDATE ON public.withdrawal_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
