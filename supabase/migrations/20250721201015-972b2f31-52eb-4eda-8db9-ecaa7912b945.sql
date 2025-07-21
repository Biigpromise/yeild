
-- Add payment tracking for brand campaigns
ALTER TABLE brand_campaigns 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id),
ADD COLUMN IF NOT EXISTS admin_approval_status TEXT DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create campaign approval notifications for admins
CREATE TABLE IF NOT EXISTS campaign_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES auth.users(id),
  payment_amount DECIMAL(10,2),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on campaign approval requests
ALTER TABLE campaign_approval_requests ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all approval requests
CREATE POLICY "Admins can view all approval requests" ON campaign_approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update approval requests
CREATE POLICY "Admins can update approval requests" ON campaign_approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create approval request when campaign is paid
CREATE OR REPLACE FUNCTION create_campaign_approval_request()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment status changes to 'paid', create approval request
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    INSERT INTO campaign_approval_requests (
      campaign_id, 
      brand_id, 
      payment_amount, 
      payment_transaction_id
    ) VALUES (
      NEW.id,
      NEW.brand_id,
      NEW.budget,
      NEW.payment_transaction_id
    );
    
    -- Create admin notification
    INSERT INTO admin_notifications (type, message, link_to)
    VALUES (
      'campaign_approval_needed',
      'New paid campaign "' || NEW.title || '" needs approval',
      '/admin?section=campaigns&campaign=' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for campaign approval requests
DROP TRIGGER IF EXISTS trigger_campaign_approval_request ON brand_campaigns;
CREATE TRIGGER trigger_campaign_approval_request
  AFTER UPDATE ON brand_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_campaign_approval_request();

-- Update payment transactions to link with campaigns
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES brand_campaigns(id);
