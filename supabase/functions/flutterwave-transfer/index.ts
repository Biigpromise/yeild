import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { data: isAdmin, error: adminErr } = await supabaseAdmin.rpc('is_admin_safe', {
      user_id_param: userData.user.id,
    });
    if (adminErr || !isAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const flwSecret = Deno.env.get('FLUTTERWAVE_SECRET_KEY')?.trim();
    if (!flwSecret) throw new Error('Flutterwave secret key not configured');

    const { amount, accountNumber, bankCode, accountName, reference } = await req.json();

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const MAX_TRANSFER_NGN = Number(Deno.env.get('FLUTTERWAVE_MAX_TRANSFER_NGN') ?? '5000000');
    if (amt > MAX_TRANSFER_NGN) {
      return new Response(JSON.stringify({ success: false, error: `Amount exceeds maximum of ₦${MAX_TRANSFER_NGN}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!accountNumber || !bankCode || !accountName) {
      return new Response(JSON.stringify({ success: false, error: 'Missing recipient details' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing Flutterwave transfer:', { amount: amt, accountNumber, bankCode, reference, by: userData.user.id });

    const transferResp = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flwSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank: bankCode,
        account_number: accountNumber,
        amount: amt,
        narration: 'Withdrawal from YEILD platform',
        currency: 'NGN',
        reference: reference,
        beneficiary_name: accountName,
      }),
    });

    const transferData = await transferResp.json();
    console.log('Flutterwave transfer response:', transferData);

    if (transferData.status === 'success') {
      return new Response(JSON.stringify({
        success: true,
        data: transferData.data,
        message: 'Transfer initiated successfully',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    return new Response(JSON.stringify({
      success: false,
      error: transferData.message || 'Transfer failed',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  } catch (error) {
    console.error('flutterwave-transfer error:', error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
