import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReconcileRequest {
  user_id?: string;
  tx_ref?: string;
  dry_run?: boolean;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set auth context for admin check
    supabase.auth.setAuth(authHeader.replace('Bearer ', ''))
    
    // Check if user is admin
    const { data: adminCheck } = await supabase.rpc('is_admin_safe', { 
      user_id_param: (await supabase.auth.getUser()).data.user?.id 
    })
    
    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { user_id, tx_ref, dry_run = false, limit = 50 }: ReconcileRequest = await req.json()

    // Build query for unprocessed brand payments
    let query = supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', 'successful')
      .eq('payment_type', 'wallet_funding')
      .is('processed_at', null)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (user_id) {
      query = query.eq('user_id', user_id)
    }
    if (tx_ref) {
      query = query.eq('tx_ref', tx_ref)
    }

    const { data: payments, error: paymentsError } = await query

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []
    let processed = 0

    for (const payment of payments || []) {
      try {
        // Check if already processed
        const { data: existingTransaction } = await supabase
          .from('brand_wallet_transactions')
          .select('id')
          .eq('payment_transaction_id', payment.id)
          .maybeSingle()

        if (existingTransaction) {
          results.push({
            payment_id: payment.id,
            status: 'already_processed',
            message: 'Payment already has wallet transaction'
          })
          continue
        }

        // Check if brand wallet exists
        const { data: wallet, error: walletError } = await supabase
          .from('brand_wallets')
          .select('*')
          .eq('brand_id', payment.user_id)
          .maybeSingle()

        if (walletError) {
          results.push({
            payment_id: payment.id,
            status: 'error',
            message: `Wallet error: ${walletError.message}`
          })
          continue
        }

        // Create wallet if doesn't exist
        if (!wallet) {
          if (!dry_run) {
            const { error: createWalletError } = await supabase
              .from('brand_wallets')
              .insert({
                brand_id: payment.user_id,
                balance: 0.00,
                total_deposited: 0.00,
                total_spent: 0.00
              })
            
            if (createWalletError) {
              results.push({
                payment_id: payment.id,
                status: 'error',
                message: `Failed to create wallet: ${createWalletError.message}`
              })
              continue
            }
          }
        }

        // Process the wallet transaction
        if (!dry_run) {
          const { data: transactionResult, error: transactionError } = await supabase
            .rpc('process_wallet_transaction', {
              p_brand_id: payment.user_id,
              p_transaction_type: 'deposit',
              p_amount: payment.amount,
              p_description: `Wallet funding - ${payment.tx_ref}`,
              p_payment_transaction_id: payment.id
            })

          if (transactionError) {
            results.push({
              payment_id: payment.id,
              status: 'error',
              message: `Transaction error: ${transactionError.message}`
            })
            continue
          }

          // Mark payment as processed
          await supabase
            .from('payment_transactions')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', payment.id)
        }

        results.push({
          payment_id: payment.id,
          status: dry_run ? 'would_process' : 'processed',
          amount: payment.amount,
          tx_ref: payment.tx_ref,
          message: dry_run ? 'Would create wallet transaction' : 'Wallet transaction created'
        })

        processed++

      } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error)
        results.push({
          payment_id: payment.id,
          status: 'error',
          message: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: processed,
        total_payments: payments?.length || 0,
        dry_run,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Reconcile function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})