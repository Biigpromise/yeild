
-- Create email delivery logs table for monitoring email performance
CREATE TABLE public.email_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('password_reset', 'verification', 'brand_confirmation', 'notification')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  delivery_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email delivery logs
CREATE POLICY "Admins can view all email logs" 
  ON public.email_delivery_logs 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Service role can manage email logs" 
  ON public.email_delivery_logs 
  FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- Create indexes for better performance
CREATE INDEX idx_email_delivery_logs_email ON public.email_delivery_logs(email);
CREATE INDEX idx_email_delivery_logs_status ON public.email_delivery_logs(status);
CREATE INDEX idx_email_delivery_logs_sent_at ON public.email_delivery_logs(sent_at);
CREATE INDEX idx_email_delivery_logs_email_type ON public.email_delivery_logs(email_type);

-- Create trigger for updated_at
CREATE TRIGGER update_email_delivery_logs_updated_at
  BEFORE UPDATE ON public.email_delivery_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
