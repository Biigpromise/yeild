
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { account_number, account_bank } = await req.json();

    console.log('Verifying account:', { account_number, account_bank });

    // Validate required fields
    if (!account_number || !account_bank) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Account number and bank code are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Validate account number format (should be 10 digits)
    if (!/^\d{10}$/.test(account_number)) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Account number must be exactly 10 digits' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: account_number,
        account_bank: account_bank
      })
    });

    const data = await response.json();
    console.log('Flutterwave response:', data);

    if (!response.ok) {
      console.error('Flutterwave API error:', data);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: data.message || 'Failed to verify account with bank' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      );
    }

    if (data.status === 'success' && data.data?.account_name) {
      return new Response(
        JSON.stringify({ 
          status: 'success',
          data: {
            account_name: data.data.account_name,
            account_number: account_number,
            bank_code: account_bank
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: data.message || 'Invalid account details. Please check and try again.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

  } catch (error) {
    console.error('Error in verify-bank-account function:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Internal server error. Please try again later.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
