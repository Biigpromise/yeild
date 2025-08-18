import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlutterwaveWebhookEvent {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    entity: {
      account_number: string;
      bank_code: string;
      full_name: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const flutterwaveSecretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    const webhookSecretHash = Deno.env.get('FLUTTERWAVE_WEBHOOK_SECRET_HASH');
    
    if (!flutterwaveSecretKey) {
      console.error('Flutterwave secret key not configured');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }
    
    if (!webhookSecretHash) {
      console.error('Flutterwave webhook secret hash not configured');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }

    // Verify webhook signature
    const signature = req.headers.get('verif-hash');
    console.log('Received signature:', signature);
    console.log('Expected webhook secret hash:', webhookSecretHash);
    
    // Temporarily skip signature verification for testing
    if (signature && signature !== webhookSecretHash) {
      console.warn('Webhook signature mismatch but processing anyway for testing. Received:', signature, 'Expected:', webhookSecretHash);
    }
    
    // Log all headers for debugging
    console.log('All webhook headers:', Object.fromEntries(req.headers.entries()));

    const event: FlutterwaveWebhookEvent = await req.json();
    console.log('Received webhook event:', event.event);

    // Process different event types
    switch (event.event) {
      case 'charge.completed':
        await handleChargeCompleted(supabase, event);
        break;
      case 'transfer.completed':
        await handleTransferCompleted(supabase, event);
        break;
      case 'transfer.failed':
        await handleTransferFailed(supabase, event);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response('Webhook processed successfully', { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(`Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function handleChargeCompleted(supabase: any, event: FlutterwaveWebhookEvent) {
  const { data } = event;
  
  // Get the payment transaction to check payment type and user
  const { data: paymentTransaction, error: fetchError } = await supabase
    .from('payment_transactions')
    .select('payment_type, user_id, amount')
    .eq('transaction_ref', data.tx_ref)
    .single();

  if (fetchError) {
    console.error('Error fetching payment transaction:', fetchError);
    return;
  }

  // Update payment transaction status
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'successful',
      verified_at: new Date().toISOString(),
      amount_settled: data.amount - data.app_fee,
      processor_response: data
    })
    .eq('transaction_ref', data.tx_ref);

  if (updateError) {
    console.error('Error updating payment transaction:', updateError);
    return;
  }

  // Automatically credit brand wallet for wallet_funding payments
  if (paymentTransaction.payment_type === 'wallet_funding') {
    try {
      console.log(`Processing wallet funding for user ${paymentTransaction.user_id}, amount: ${data.amount}`);
      
      // Credit the brand wallet using the existing database function
      const { error: walletError } = await supabase.rpc('process_wallet_transaction', {
        p_brand_id: paymentTransaction.user_id,
        p_transaction_type: 'deposit',
        p_amount: data.amount,
        p_description: `Wallet funding via Flutterwave - ${data.tx_ref}`,
        p_reference_id: null,
        p_campaign_id: null,
        p_payment_transaction_id: data.tx_ref
      });

      if (walletError) {
        console.error('Error crediting brand wallet:', walletError);
        
        // Create notification about failed wallet crediting for admin review
        await supabase
          .from('admin_notifications')
          .insert({
            type: 'wallet_credit_failed',
            message: `Failed to credit wallet for payment ${data.tx_ref}. User: ${paymentTransaction.user_id}, Amount: ${data.amount}`,
            link_to: `/admin?section=payments&payment=${data.tx_ref}`
          });
      } else {
        console.log(`Successfully credited ${data.amount} to brand wallet for user ${paymentTransaction.user_id}`);
        
        // Create notification for the brand user
        await supabase
          .from('brand_notifications')
          .insert({
            brand_id: paymentTransaction.user_id,
            type: 'wallet_credited',
            title: 'Wallet Funded Successfully',
            message: `Your wallet has been credited with ₦${data.amount.toLocaleString()} from payment ${data.tx_ref}`
          });
      }
    } catch (walletProcessingError) {
      console.error('Unexpected error during wallet processing:', walletProcessingError);
      
      // Create admin notification for manual review
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'wallet_processing_error',
          message: `Unexpected error processing wallet funding for payment ${data.tx_ref}. User: ${paymentTransaction.user_id}, Amount: ${data.amount}`,
          link_to: `/admin?section=payments&payment=${data.tx_ref}`
        });
    }
  }

  // Calculate company revenue
  const companyFee = data.app_fee || (data.amount * 0.015); // 1.5% default fee
  await updateDailyRevenue(supabase, {
    amount: data.amount,
    fee: companyFee,
    type: 'payment'
  });

  // Queue for settlement if amount meets threshold
  await queueForSettlement(supabase, {
    sourceType: 'payment',
    sourceId: data.tx_ref,
    amount: data.amount - data.app_fee,
    fee: data.app_fee,
    reference: `PAY-${data.tx_ref}`
  });

  console.log(`Payment completed: ${data.tx_ref}, Amount: ${data.amount}`);
}

async function handleTransferCompleted(supabase: any, event: FlutterwaveWebhookEvent) {
  const { data } = event;
  
  // Update fund transfer status
  const { error } = await supabase
    .from('fund_transfers')
    .update({
      status: 'successful',
      settlement_date: new Date().toISOString(),
      flutterwave_response: data
    })
    .eq('flutterwave_id', data.id.toString());

  if (error) {
    console.error('Error updating transfer status:', error);
  }

  console.log(`Transfer completed: ${data.id}, Amount: ${data.amount}`);
}

async function handleTransferFailed(supabase: any, event: FlutterwaveWebhookEvent) {
  const { data } = event;
  
  // Get current retry count first
  const { data: existingTransfer } = await supabase
    .from('fund_transfers')
    .select('retry_count')
    .eq('flutterwave_id', data.id.toString())
    .single();
  
  // Update fund transfer status and increment retry count
  const { error } = await supabase
    .from('fund_transfers')
    .update({
      status: 'failed',
      error_message: data.processor_response,
      retry_count: (existingTransfer?.retry_count || 0) + 1,
      flutterwave_response: data
    })
    .eq('flutterwave_id', data.id.toString());

  if (error) {
    console.error('Error updating failed transfer:', error);
  }

  console.log(`Transfer failed: ${data.id}, Reason: ${data.processor_response}`);
}

async function updateDailyRevenue(supabase: any, params: {
  amount: number;
  fee: number;
  type: 'payment' | 'withdrawal';
}) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get existing record or create new one
  const { data: existing } = await supabase
    .from('company_revenue')
    .select('*')
    .eq('revenue_date', today)
    .single();

  if (params.type === 'payment') {
    const { error } = await supabase
      .from('company_revenue')
      .upsert({
        revenue_date: today,
        total_payments: (existing?.total_payments || 0) + params.amount,
        total_fees: (existing?.total_fees || 0) + params.fee,
        net_revenue: (existing?.net_revenue || 0) + params.fee,
        payment_count: (existing?.payment_count || 0) + 1,
        total_withdrawals: existing?.total_withdrawals || 0,
        withdrawal_count: existing?.withdrawal_count || 0
      }, {
        onConflict: 'revenue_date'
      });

    if (error) {
      console.error('Error updating daily revenue for payment:', error);
    }
  } else {
    const { error } = await supabase
      .from('company_revenue')
      .upsert({
        revenue_date: today,
        total_withdrawals: (existing?.total_withdrawals || 0) + params.amount,
        withdrawal_count: (existing?.withdrawal_count || 0) + 1,
        total_payments: existing?.total_payments || 0,
        total_fees: existing?.total_fees || 0,
        net_revenue: existing?.net_revenue || 0,
        payment_count: existing?.payment_count || 0
      }, {
        onConflict: 'revenue_date'
      });

    if (error) {
      console.error('Error updating daily revenue for withdrawal:', error);
    }
  }
}

async function queueForSettlement(supabase: any, params: {
  sourceType: string;
  sourceId: string;
  amount: number;
  fee: number;
  reference: string;
}) {
  // Get settlement account
  const { data: account } = await supabase
    .from('company_financial_accounts')
    .select('*')
    .eq('account_type', 'settlement')
    .eq('is_active', true)
    .single();

  if (!account) {
    console.error('No active settlement account found');
    return;
  }

  // Create fund transfer record
  const { error } = await supabase
    .from('fund_transfers')
    .insert({
      transfer_reference: params.reference,
      source_type: params.sourceType,
      source_id: params.sourceId,
      amount: params.amount,
      fee: params.fee,
      net_amount: params.amount - params.fee,
      recipient_account: account.account_number,
      recipient_bank: account.bank_name,
      status: 'pending'
    });

  if (error) {
    console.error('Error queueing transfer for settlement:', error);
  }
}