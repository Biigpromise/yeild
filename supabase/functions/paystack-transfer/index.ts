import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ----- AuthN/Z: require admin -----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: isAdmin, error: adminErr } = await supabaseAdmin.rpc('is_admin_safe', {
      user_id_param: userData.user.id,
    });
    if (adminErr || !isAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ----------------------------------

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')?.trim();
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const {
      amount,
      accountNumber,
      bankCode,
      accountName,
      recipientCode,
      reference,
    } = await req.json();

    // ----- Input validation -----
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const MAX_TRANSFER_NGN = Number(Deno.env.get('PAYSTACK_MAX_TRANSFER_NGN') ?? '5000000');
    if (amt > MAX_TRANSFER_NGN) {
      return new Response(JSON.stringify({ success: false, error: `Amount exceeds maximum of ₦${MAX_TRANSFER_NGN}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!recipientCode && (!accountNumber || !bankCode || !accountName)) {
      return new Response(JSON.stringify({ success: false, error: 'Missing recipient details' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ----------------------------

    console.log('Processing Paystack transfer:', { amount: amt, accountNumber, bankCode, reference, by: userData.user.id });

    // Create transfer recipient if not exists
    let recipient = recipientCode;
    
    if (!recipient) {
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN'
        }),
      });

      const recipientData = await recipientResponse.json();
      console.log('Recipient creation response:', recipientData);

      if (!recipientData.status) {
        throw new Error(recipientData.message || 'Failed to create transfer recipient');
      }

      recipient = recipientData.data.recipient_code;
    }

    // Initiate transfer
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(amt * 100), // Convert to kobo
        recipient: recipient,
        reference: reference,
        reason: 'Withdrawal from Yield platform'
      }),
    });

    const transferData = await transferResponse.json();
    console.log('Transfer response:', transferData);

    if (transferData.status) {
      return new Response(
        JSON.stringify({
          success: true,
          data: transferData.data,
          message: 'Transfer initiated successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: transferData.message || 'Transfer failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

  } catch (error) {
    console.error('Error processing Paystack transfer:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
