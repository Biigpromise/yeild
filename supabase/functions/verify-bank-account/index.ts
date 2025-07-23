
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { account_number, account_bank } = await req.json()

    if (!account_number || !account_bank) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Account number and bank code are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Verifying account:', { account_number, account_bank })

    // Use live Flutterwave API endpoint
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number,
        account_bank
      })
    })

    const data = await response.json()
    console.log('Flutterwave response:', data)

    if (data.status === 'success' && data.data && data.data.account_name) {
      return new Response(
        JSON.stringify({
          success: true,
          account_name: data.data.account_name,
          account_number: data.data.account_number,
          bank_code: account_bank
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || 'Account verification failed. Please check your account details.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error verifying account:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Bank verification service is temporarily unavailable. Please try again later.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
