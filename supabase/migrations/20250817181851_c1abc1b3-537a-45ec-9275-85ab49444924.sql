-- Process the pending ₦2,000 (2 x ₦1,000) payments
-- First payment: f0fa846b-25fa-4d3a-92a3-e36b90d0a50a
-- Second payment: f87f8819-80ad-43a2-a237-23804f07f02c

-- Call the process_wallet_transaction function for the first pending payment
SELECT process_wallet_transaction(
  '1f952d00-3288-4597-a761-8fddde0d6a6e'::uuid,
  'deposit',
  1000.00,
  'Wallet funding payment: flw_1755452780912_1f952d00',
  'f0fa846b-25fa-4d3a-92a3-e36b90d0a50a'::uuid,
  NULL::uuid,
  'f0fa846b-25fa-4d3a-92a3-e36b90d0a50a'::uuid
);

-- Call the process_wallet_transaction function for the second pending payment  
SELECT process_wallet_transaction(
  '1f952d00-3288-4597-a761-8fddde0d6a6e'::uuid,
  'deposit',
  1000.00,
  'Wallet funding payment: flw_1755451866750_1f952d00',
  'f87f8819-80ad-43a2-a237-23804f07f02c'::uuid,
  NULL::uuid,
  'f87f8819-80ad-43a2-a237-23804f07f02c'::uuid
);