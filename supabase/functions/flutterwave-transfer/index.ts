import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      return new Response(
        JSON.stringify({ success: false, message: 'Configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transferRequest = await req.json();

    // Prepare Flutterwave transfer payload
    const transferPayload = {
      account_bank: transferRequest.account_bank,
      account_number: transferRequest.account_number,
      amount: transferRequest.amount,
      narration: transferRequest.narration || 'User payout',
      currency: transferRequest.currency || 'NGN',
      reference: transferRequest.reference,
      beneficiary_name: transferRequest.beneficiary_name
    };

    // Make transfer request to Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transferPayload)
    });

    const flutterwaveResponse = await response.json();

    if (response.ok && flutterwaveResponse.status === 'success') {
      const transferData = flutterwaveResponse.data;
      
      return new Response(
        JSON.stringify({
          success: true,
          transfer_id: transferData.id,
          reference: transferRequest.reference,
          message: 'Transfer initiated successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: flutterwaveResponse.message || 'Transfer initiation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});