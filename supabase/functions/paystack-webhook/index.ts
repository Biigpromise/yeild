import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) throw new Error('Paystack secret key not configured');

    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') ?? '';
    const expected = createHmac('sha512', paystackSecretKey).update(rawBody).digest('hex');
    if (signature !== expected) {
      console.warn('Invalid Paystack signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('Paystack event:', event.event, event.data?.reference);

    if (event.event !== 'charge.success') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const data = event.data;
    const meta = data.metadata ?? {};
    const userId = meta.user_id;
    const paymentType = meta.payment_type ?? 'wallet_funding';
    const amount = Number(data.amount) / 100; // back to naira
    const reference = data.reference;

    if (!userId) {
      console.warn('No user_id in metadata, skipping');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Idempotency: skip if we've already recorded this reference
    const { data: existing } = await supabase
      .from('brand_wallet_transactions')
      .select('id')
      .eq('description', `Paystack ref: ${reference}`)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert brand wallet
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
      description: `Paystack ref: ${reference}`,
      campaign_id: meta.campaign_id ?? null,
    });

    // If this funded a specific campaign, update its funded_amount
    if (paymentType === 'campaign_funding' && meta.campaign_id) {
      const { data: campaign } = await supabase
        .from('brand_campaigns')
        .select('funded_amount')
        .eq('id', meta.campaign_id)
        .single();
      if (campaign) {
        await supabase
          .from('brand_campaigns')
          .update({ funded_amount: Number(campaign.funded_amount) + amount, payment_status: 'paid' })
          .eq('id', meta.campaign_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paystack-webhook error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
