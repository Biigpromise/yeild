-- Add Paystack payment method configuration
INSERT INTO public.payment_method_configs (
  method_key,
  name,
  enabled,
  min_amount,
  max_amount,
  processing_fee_percent,
  processing_time_estimate,
  configuration_details
) VALUES (
  'paystack',
  'Paystack Bank Transfer',
  true,
  500,
  5000000,
  2.0,
  '2-10 minutes',
  jsonb_build_object(
    'description', 'Fast and secure bank transfers with lower fees',
    'supported_banks', 'All Nigerian banks',
    'currency', 'NGN',
    'features', jsonb_build_array('Instant verification', 'Lower fees', 'Reliable transfers')
  )
) ON CONFLICT (method_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  processing_fee_percent = EXCLUDED.processing_fee_percent,
  processing_time_estimate = EXCLUDED.processing_time_estimate,
  configuration_details = EXCLUDED.configuration_details;
