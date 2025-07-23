
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      amount, 
      currency, 
      customer_name, 
      customer_email,
      payment_type,
      campaign_id,
      redirect_url 
    } = await req.json()

    if (!amount || !customer_email || !customer_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing payment:', { amount, currency, customer_email, payment_type })

    // Generate unique transaction reference
    const tx_ref = `YIELD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create Flutterwave payment
    const paymentData = {
      tx_ref,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      redirect_url: redirect_url || `${req.headers.get('origin')}/payment-success`,
      customer: {
        email: customer_email,
        name: customer_name
      },
      meta: {
        payment_type,
        campaign_id
      },
      customizations: {
        title: 'YIELD Payment',
        description: payment_type === 'campaign_funding' ? 'Campaign Funding' : 'Payment',
        logo: 'https://your-logo-url.com/logo.png'
      }
    }

    // Use live Flutterwave API
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const data = await response.json()
    console.log('Flutterwave payment response:', data)

    if (data.status === 'success') {
      // Store transaction in database
      const transactionData = {
        transaction_ref: tx_ref,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        customer_email,
        customer_name,
        payment_type,
        campaign_id,
        flutterwave_id: data.data.id,
        status: 'pending'
      }

      // Store in database using Supabase
      const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify(transactionData)
      })

      if (!dbResponse.ok) {
        console.error('Failed to store transaction in database')
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment_link: data.data.link,
          transaction_ref: tx_ref
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || 'Payment initialization failed'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
