
-- Create the 'customer_support_tickets' table
CREATE TABLE public.customer_support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- e.g., 'open', 'in_progress', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS and Indexes
ALTER TABLE public.customer_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE INDEX customer_support_tickets_user_id_idx ON public.customer_support_tickets(user_id);
CREATE INDEX customer_support_tickets_status_idx ON public.customer_support_tickets(status);

-- RLS Policies
CREATE POLICY "Users can create their own support tickets"
ON public.customer_support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own support tickets"
ON public.customer_support_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own open tickets"
ON public.customer_support_tickets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'open');

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER handle_customer_support_tickets_updated_at
BEFORE UPDATE ON public.customer_support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
