
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    console.log('Verifying account (LIVE):', { account_number, account_bank })

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

    // Handle both successful and unsuccessful responses properly
    if (response.ok && data.status === 'success' && data.data) {
      return new Response(
        JSON.stringify({
          success: true,
          account_name: data.data.account_name,
          account_number: data.data.account_number,
          bank_code: account_bank
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      // Handle non-2xx responses and unsuccessful data
      const errorMessage = data.message || 'Account verification failed'
      console.error('Account verification failed:', errorMessage)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage
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
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
