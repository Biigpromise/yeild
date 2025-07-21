-- Insert Flutterwave payment method configuration
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
  'flutterwave',
  'Flutterwave',
  true,
  1000,
  100000,
  3.5,
  '1-3 business days',
  '{
    "supportedCurrencies": ["NGN", "USD", "GHS", "KES", "UGX", "TZS", "RWF", "ZMW"],
    "supportedCountries": ["NG", "GH", "KE", "UG", "TZ", "RW", "ZM", "US"],
    "description": "Fast and secure payments across Africa and globally",
    "features": ["Multi-currency support", "Real-time processing", "Bank transfers", "Mobile money"]
  }'::jsonb
)
ON CONFLICT (method_key) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = EXCLUDED.enabled,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  processing_fee_percent = EXCLUDED.processing_fee_percent,
  processing_time_estimate = EXCLUDED.processing_time_estimate,
  configuration_details = EXCLUDED.configuration_details;