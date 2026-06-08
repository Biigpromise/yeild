import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SettlementRequest {
  scheduleId?: string;
  manualTrigger?: boolean;
  minimumAmount?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')?.trim();
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }

    let requestData: SettlementRequest = {};
    if (req.method === 'POST') {
      try { requestData = await req.json(); } catch { /* defaults */ }
    }

    const result = await processSettlements(supabase, paystackSecretKey, requestData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Settlement processing error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processSettlements(
  supabase: any,
  paystackSecretKey: string,
  request: SettlementRequest
) {
  console.log('Starting Paystack settlement process...');

  const { data: account, error: accountError } = await supabase
    .from('company_financial_accounts')
    .select('*')
    .eq('account_type', 'settlement')
    .eq('is_active', true)
    .single();

  if (accountError || !account) {
    throw new Error('No active settlement account found');
  }

  const minimumAmount = request.minimumAmount || 5000;

  const { data: pendingTransfers, error: transfersError } = await supabase
    .from('fund_transfers')
    .select('*')
    .eq('status', 'pending')
    .gte('net_amount', minimumAmount)
    .order('created_at', { ascending: true });

  if (transfersError) {
    throw new Error(`Error fetching pending transfers: ${transfersError.message}`);
  }

  if (!pendingTransfers || pendingTransfers.length === 0) {
    return {
      success: true,
      message: 'No pending transfers meeting criteria',
      processedCount: 0
    };
  }

  const totalAmount = pendingTransfers.reduce((sum: number, t: any) => sum + Number(t.net_amount), 0);
  const transferIds = pendingTransfers.map((t: any) => t.id);
  const transferReference = `SETTLEMENT-${Date.now()}`;

  console.log(`Processing ${pendingTransfers.length} transfers, total: ₦${totalAmount}`);

  // 1. Create/resolve transfer recipient on Paystack
  const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: account.account_name || 'Settlement Account',
      account_number: account.account_number,
      bank_code: account.bank_code,
      currency: 'NGN',
    }),
  });
  const recipientData = await recipientRes.json();
  if (!recipientData.status) {
    throw new Error(`Recipient creation failed: ${recipientData.message}`);
  }
  const recipientCode = recipientData.data.recipient_code;

  // 2. Initiate transfer (Paystack uses kobo)
  const transferRes = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(totalAmount * 100),
      recipient: recipientCode,
      reference: transferReference,
      reason: `Bulk settlement for ${pendingTransfers.length} transactions`,
    }),
  });
  const transferData = await transferRes.json();

  if (!transferData.status) {
    throw new Error(`Transfer failed: ${transferData.message}`);
  }

  // 3. Update fund_transfers (reuse legacy column names as generic provider fields)
  const { error: updateError } = await supabase
    .from('fund_transfers')
    .update({
      status: 'processing',
      flutterwave_id: transferData.data.transfer_code || String(transferData.data.id || ''),
      flutterwave_response: transferData.data,
      updated_at: new Date().toISOString()
    })
    .in('id', transferIds);

  if (updateError) {
    console.error('Error updating transfer statuses:', updateError);
  }

  if (request.scheduleId) {
    await updateSettlementSchedule(supabase, request.scheduleId);
  }

  return {
    success: true,
    message: `Settlement initiated for ₦${totalAmount}`,
    processedCount: pendingTransfers.length,
    transferReference,
    paystackTransferCode: transferData.data.transfer_code,
  };
}

async function updateSettlementSchedule(supabase: any, scheduleId: string) {
  const now = new Date();
  const { data: schedule } = await supabase
    .from('settlement_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();
  if (!schedule) return;

  let nextRun = new Date(now);
  switch (schedule.frequency) {
    case 'daily': nextRun.setDate(nextRun.getDate() + 1); break;
    case 'weekly': nextRun.setDate(nextRun.getDate() + 7); break;
    case 'monthly': nextRun.setMonth(nextRun.getMonth() + 1); break;
  }
  const [hours, minutes] = (schedule.time_of_day || '00:00').split(':');
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  await supabase
    .from('settlement_schedules')
    .update({
      last_run: now.toISOString(),
      next_run: nextRun.toISOString()
    })
    .eq('id', scheduleId);
}
