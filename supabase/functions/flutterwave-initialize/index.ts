import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const flwSecret = Deno.env.get('FLUTTERWAVE_SECRET_KEY')?.trim();
    if (!flwSecret) throw new Error('Flutterwave secret key not configured');

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, email, payment_type, campaign_id, callback_url } = await req.json();
    if (!amount || Number(amount) < 100) throw new Error('Amount must be at least ₦100');

    const tx_ref = `yld_${payment_type ?? 'wallet_funding'}_${user.id.slice(0, 8)}_${Date.now()}`;

    const resp = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flwSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref,
        amount: Number(amount),
        currency: 'NGN',
        redirect_url: callback_url,
        customer: {
          email: email ?? user.email,
          name: user.user_metadata?.name ?? user.email,
        },
        customizations: {
          title: 'YEILD',
          description: payment_type === 'campaign_funding' ? 'Campaign Funding' : 'Wallet Funding',
        },
        meta: {
          user_id: user.id,
          payment_type: payment_type ?? 'wallet_funding',
          campaign_id: campaign_id ?? null,
          amount_naira: Number(amount),
        },
      }),
    });

    const data = await resp.json();
    if (data.status !== 'success' || !data.data?.link) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return new Response(JSON.stringify({
      success: true,
      authorization_url: data.data.link,
      reference: tx_ref,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('flutterwave-initialize error:', error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
