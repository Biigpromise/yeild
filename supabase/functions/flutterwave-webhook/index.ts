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
    if (!flutterwaveSecretKey) {
      console.error('Flutterwave secret key not configured');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }

    // Verify webhook signature
    const signature = req.headers.get('verif-hash');
    const webhookSecret = flutterwaveSecretKey; // Use your webhook secret hash
    
    if (signature !== webhookSecret) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

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
  
  // Update payment transaction status
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      verified_at: new Date().toISOString(),
      amount_settled: data.amount - data.app_fee,
      processor_response: data
    })
    .eq('transaction_ref', data.tx_ref);

  if (updateError) {
    console.error('Error updating payment transaction:', updateError);
    return;
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
  
  // Update fund transfer status and increment retry count
  const { error } = await supabase
    .from('fund_transfers')
    .update({
      status: 'failed',
      error_message: data.processor_response,
      retry_count: supabase.raw('retry_count + 1'),
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
  
  const updateData = params.type === 'payment' 
    ? {
        total_payments: supabase.raw(`total_payments + ${params.amount}`),
        total_fees: supabase.raw(`total_fees + ${params.fee}`),
        net_revenue: supabase.raw(`net_revenue + ${params.fee}`),
        payment_count: supabase.raw('payment_count + 1')
      }
    : {
        total_withdrawals: supabase.raw(`total_withdrawals + ${params.amount}`),
        withdrawal_count: supabase.raw('withdrawal_count + 1')
      };

  const { error } = await supabase
    .from('company_revenue')
    .upsert({
      revenue_date: today,
      ...updateData
    }, {
      onConflict: 'revenue_date'
    });

  if (error) {
    console.error('Error updating daily revenue:', error);
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