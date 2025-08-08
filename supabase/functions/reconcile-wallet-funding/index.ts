import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReconcileRequest {
  user_id?: string;
  tx_ref?: string;
  dry_run?: boolean;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for privileged operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError || !roles?.some(r => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReconcileRequest = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(body.limit ?? 100, 1), 1000);

    // Fetch successful wallet_funding payments
    let query = supabase
      .from('payment_transactions')
      .select('id, user_id, transaction_ref, amount, amount_settled, payment_type, status, created_at')
      .eq('status', 'successful')
      .eq('payment_type', 'wallet_funding')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (body.user_id) query = query.eq('user_id', body.user_id);
    if (body.tx_ref) query = query.eq('transaction_ref', body.tx_ref);

    const { data: payments, error: paymentsError } = await query;
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch payments' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payments || payments.length === 0) {
      return new Response(JSON.stringify({ reconciled: 0, details: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find already recorded wallet transactions to avoid duplicates
    const paymentIds = payments.map(p => p.id);
    const { data: existingWalletTxns, error: walletTxnsError } = await supabase
      .from('brand_wallet_transactions')
      .select('payment_transaction_id')
      .in('payment_transaction_id', paymentIds);

    if (walletTxnsError) {
      console.error('Error fetching wallet transactions:', walletTxnsError);
    }

    const alreadyProcessed = new Set((existingWalletTxns || []).map(t => t.payment_transaction_id));

    const results: Array<{ payment_id: string; user_id: string; tx_ref: string; action: string; amount: number | null; }> = [];

    for (const p of payments) {
      if (alreadyProcessed.has(p.id)) {
        results.push({ payment_id: p.id, user_id: p.user_id, tx_ref: p.transaction_ref, action: 'skipped_exists', amount: p.amount_settled || p.amount });
        continue;
      }

      // Ensure wallet exists
      const { data: wallet } = await supabase
        .from('brand_wallets')
        .select('id')
        .eq('brand_id', p.user_id)
        .maybeSingle();

      if (!wallet) {
        const { error: createWalletError } = await supabase.from('brand_wallets').insert({
          brand_id: p.user_id,
          balance: 0,
          total_deposited: 0,
          total_spent: 0
        });
        if (createWalletError) {
          console.error('Failed to create wallet for', p.user_id, createWalletError);
          results.push({ payment_id: p.id, user_id: p.user_id, tx_ref: p.transaction_ref, action: 'error_wallet_create', amount: p.amount_settled || p.amount });
          continue;
        }
      }

      const depositAmount = p.amount_settled || p.amount;
      if (body.dry_run) {
        results.push({ payment_id: p.id, user_id: p.user_id, tx_ref: p.transaction_ref, action: 'would_deposit', amount: depositAmount });
        continue;
      }

      const { data: walletTxnId, error: rpcError } = await supabase.rpc('process_wallet_transaction', {
        p_brand_id: p.user_id,
        p_transaction_type: 'deposit',
        p_amount: depositAmount,
        p_description: `Reconciled wallet funding - ${p.transaction_ref}`,
        p_payment_transaction_id: p.id,
      });

      if (rpcError) {
        console.error('RPC error for payment', p.id, rpcError);
        results.push({ payment_id: p.id, user_id: p.user_id, tx_ref: p.transaction_ref, action: 'error_rpc', amount: depositAmount });
        continue;
      }

      results.push({ payment_id: p.id, user_id: p.user_id, tx_ref: p.transaction_ref, action: 'deposited', amount: depositAmount });
    }

    const reconciledCount = results.filter(r => r.action === 'deposited').length;

    return new Response(JSON.stringify({ reconciled: reconciledCount, details: results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
