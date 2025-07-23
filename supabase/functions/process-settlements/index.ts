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

    let requestData: SettlementRequest = {};
    
    if (req.method === 'POST') {
      try {
        requestData = await req.json();
      } catch {
        // If no JSON body, use defaults
      }
    }

    const result = await processSettlements(supabase, flutterwaveSecretKey, requestData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Settlement processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processSettlements(
  supabase: any, 
  flutterwaveSecretKey: string, 
  request: SettlementRequest
) {
  console.log('Starting settlement process...');

  // Get settlement account
  const { data: account, error: accountError } = await supabase
    .from('company_financial_accounts')
    .select('*')
    .eq('account_type', 'settlement')
    .eq('is_active', true)
    .single();

  if (accountError || !account) {
    throw new Error('No active settlement account found');
  }

  // Get pending transfers that meet minimum amount criteria
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

  // Group transfers and create bulk settlement
  const totalAmount = pendingTransfers.reduce((sum, transfer) => sum + Number(transfer.net_amount), 0);
  const transferIds = pendingTransfers.map(t => t.id);

  console.log(`Processing ${pendingTransfers.length} transfers, total amount: ₦${totalAmount}`);

  // Create bulk transfer to company account
  const transferReference = `SETTLEMENT-${Date.now()}`;
  const transferResult = await initiateFlutterwaveTransfer(
    flutterwaveSecretKey,
    {
      account_number: account.account_number,
      account_bank: account.bank_code,
      amount: totalAmount,
      reference: transferReference,
      narration: `Bulk settlement for ${pendingTransfers.length} transactions`,
      currency: 'NGN'
    }
  );

  if (!transferResult.success) {
    throw new Error(`Transfer failed: ${transferResult.message}`);
  }

  // Update fund transfers status
  const { error: updateError } = await supabase
    .from('fund_transfers')
    .update({
      status: 'processing',
      flutterwave_id: transferResult.data.id.toString(),
      flutterwave_response: transferResult.data,
      updated_at: new Date().toISOString()
    })
    .in('id', transferIds);

  if (updateError) {
    console.error('Error updating transfer statuses:', updateError);
  }

  // Update settlement schedule if this was a scheduled run
  if (request.scheduleId) {
    await updateSettlementSchedule(supabase, request.scheduleId);
  }

  return {
    success: true,
    message: `Settlement initiated for ₦${totalAmount}`,
    processedCount: pendingTransfers.length,
    transferReference,
    flutterwaveId: transferResult.data.id
  };
}

async function initiateFlutterwaveTransfer(secretKey: string, transferData: any) {
  try {
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Transfer failed',
        data: result
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
}

async function updateSettlementSchedule(supabase: any, scheduleId: string) {
  const now = new Date();
  
  // Calculate next run time based on schedule frequency
  const { data: schedule } = await supabase
    .from('settlement_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();

  if (!schedule) return;

  let nextRun = new Date(now);
  
  switch (schedule.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
  }

  // Set the time
  const [hours, minutes] = schedule.time_of_day.split(':');
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  await supabase
    .from('settlement_schedules')
    .update({
      last_run: now.toISOString(),
      next_run: nextRun.toISOString()
    })
    .eq('id', scheduleId);
}