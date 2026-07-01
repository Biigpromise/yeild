import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const webhookHash = Deno.env.get('FLUTTERWAVE_WEBHOOK_HASH')?.trim();
    const flwSecret = Deno.env.get('FLUTTERWAVE_SECRET_KEY')?.trim();
    if (!webhookHash) throw new Error('Flutterwave webhook hash not configured');
    if (!flwSecret) throw new Error('Flutterwave secret key not configured');

    const signature = req.headers.get('verif-hash') ?? '';
    if (signature !== webhookHash) {
      console.warn('Invalid Flutterwave webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = await req.json();
    console.log('Flutterwave event:', event.event, event.data?.tx_ref);

    // Only handle successful charge events
    const eventType = event.event ?? '';
    const eventData = event.data ?? {};
    const isChargeCompleted =
      eventType === 'charge.completed' || eventType.includes('charge');
    if (!isChargeCompleted || eventData.status !== 'successful') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Re-verify with Flutterwave to prevent spoofing
    const verifyResp = await fetch(
      `https://api.flutterwave.com/v3/transactions/${eventData.id}/verify`,
      { headers: { Authorization: `Bearer ${flwSecret}` } },
    );
    const verified = await verifyResp.json();
    if (verified.status !== 'success' || verified.data?.status !== 'successful') {
      console.warn('Flutterwave verify failed', verified);
      return new Response(JSON.stringify({ received: true, verified: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const data = verified.data;
    const meta = data.meta ?? {};
    const userId = meta.user_id;
    const paymentType = meta.payment_type ?? 'wallet_funding';
    const amount = Number(data.amount);
    const reference = data.tx_ref;

    if (!userId) {
      console.warn('No user_id in meta, skipping');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Idempotency
    const { data: existing } = await supabase
      .from('brand_wallet_transactions')
      .select('id')
      .eq('description', `Flutterwave ref: ${reference}`)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: walletRow } = await supabase
      .from('brand_wallets')
      .select('*')
      .eq('brand_id', userId)
      .maybeSingle();

    let wallet = walletRow;
    if (!wallet) {
      const { data: created, error: createErr } = await supabase
        .from('brand_wallets')
        .insert({ brand_id: userId, balance: 0, total_deposited: 0, total_spent: 0 })
        .select()
        .single();
      if (createErr) throw createErr;
      wallet = created;
    }

    const newBalance = Number(wallet.balance) + amount;
    const newTotalDeposited = Number(wallet.total_deposited) + amount;

    const { error: updErr } = await supabase
      .from('brand_wallets')
      .update({ balance: newBalance, total_deposited: newTotalDeposited })
      .eq('id', wallet.id);
    if (updErr) throw updErr;

    await supabase.from('brand_wallet_transactions').insert({
      brand_id: userId,
      wallet_id: wallet.id,
      transaction_type: 'deposit',
      amount,
      balance_after: newBalance,
      description: `Flutterwave ref: ${reference}`,
      campaign_id: meta.campaign_id ?? null,
    });

    if (paymentType === 'campaign_funding' && meta.campaign_id) {
      const { data: campaign } = await supabase
        .from('brand_campaigns')
        .select('funded_amount')
        .eq('id', meta.campaign_id)
        .single();
      if (campaign) {
        await supabase
          .from('brand_campaigns')
          .update({
            funded_amount: Number(campaign.funded_amount) + amount,
            payment_status: 'paid',
          })
          .eq('id', meta.campaign_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('flutterwave-webhook error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
