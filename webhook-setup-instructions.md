# Flutterwave Webhook Setup Instructions

## Current Issue
Payments are not automatically reflecting in brand wallets because Flutterwave is not sending webhook notifications.

## Steps to Fix:

### 1. Verify Webhook URL in Flutterwave Dashboard
1. Login to your Flutterwave Dashboard
2. Go to **Settings > Webhooks**
3. Check if the webhook URL is set to:
   ```
   https://stehjqdbncykevpokcvj.supabase.co/functions/v1/flutterwave-webhook
   ```

### 2. Test Webhook Endpoint
Use our verification endpoint to test connectivity:
```
https://stehjqdbncykevpokcvj.supabase.co/functions/v1/flutterwave-verify
```

### 3. Required Webhook Events
Ensure these events are enabled in your Flutterwave webhook configuration:
- `charge.completed` - For successful payments
- `transfer.completed` - For successful transfers/withdrawals
- `transfer.failed` - For failed transfers

### 4. Webhook Secret
Verify the webhook secret hash matches: `Yeildsocialsconcept@1111`

### 5. Manual Resend Failed Webhooks
If webhooks failed, you can resend them:
1. Go to Flutterwave Dashboard > Transactions
2. Find recent transactions
3. Click "Resend Webhook" for unprocessed payments

### 6. Alternative: API Verification
If webhooks continue failing, we can implement periodic API verification to check for new payments.

## Next Steps:
1. Verify webhook configuration in Flutterwave dashboard
2. Test the verification endpoint
3. Resend any failed webhooks for recent transactions
4. Monitor webhook logs for future payments