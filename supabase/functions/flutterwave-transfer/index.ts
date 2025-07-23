
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      account_bank, 
      account_number, 
      amount, 
      narration, 
      beneficiary_name,
      reference 
    } = await req.json()

    if (!account_bank || !account_number || !amount || !beneficiary_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: account_bank, account_number, amount, beneficiary_name' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing transfer:', { account_bank, account_number, amount, beneficiary_name })

    // Use live Flutterwave API
    const transferResponse = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank,
        account_number,
        amount: parseFloat(amount),
        narration: narration || 'Withdrawal from Yield Platform',
        currency: 'NGN',
        reference: reference || `YIELD_TRANSFER_${Date.now()}`,
        beneficiary_name,
        debit_currency: 'NGN'
      })
    })

    const transferData = await transferResponse.json()
    console.log('Flutterwave transfer response:', transferData)

    if (transferData.status === 'success') {
      return new Response(
        JSON.stringify({
          success: true,
          data: transferData.data,
          message: 'Transfer initiated successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: transferData.message || 'Transfer failed'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error processing transfer:', error)
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
