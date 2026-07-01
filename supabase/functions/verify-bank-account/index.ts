import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FLW_SECRET = Deno.env.get('FLUTTERWAVE_SECRET_KEY')?.trim();

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { account_number, account_bank } = await req.json();
    if (!account_number || !account_bank) {
      return new Response(JSON.stringify({ success: false, error: 'Account number and bank code are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!FLW_SECRET) throw new Error('Flutterwave secret key not configured');

    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_number, account_bank }),
    });
    const data = await response.json();
    console.log('Flutterwave resolve response:', data);

    if (response.ok && data.status === 'success' && data.data?.account_name) {
      return new Response(JSON.stringify({
        success: true,
        account_name: data.data.account_name,
        account_number: data.data.account_number,
        bank_code: account_bank,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: false,
      error: data.message || 'Account verification failed',
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('verify-bank-account error:', error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
