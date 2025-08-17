-- Add wallet_funding and account_funding to allowed payment types
ALTER TABLE public.payment_transactions 
DROP CONSTRAINT payment_transactions_payment_type_check;

ALTER TABLE public.payment_transactions 
ADD CONSTRAINT payment_transactions_payment_type_check 
CHECK (payment_type = ANY (ARRAY[
  'campaign_funding'::text, 
  'task_payment'::text, 
  'premium_subscription'::text, 
  'general'::text,
  'wallet_funding'::text,
  'account_funding'::text
]));