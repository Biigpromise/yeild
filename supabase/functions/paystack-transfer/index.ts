import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const { 
      amount, 
      accountNumber, 
      bankCode, 
      accountName,
      recipientCode,
      reference 
    } = await req.json();

    console.log('Processing Paystack transfer:', { amount, accountNumber, bankCode, reference });

    // Create transfer recipient if not exists
    let recipient = recipientCode;
    
    if (!recipient) {
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN'
        }),
      });

      const recipientData = await recipientResponse.json();
      console.log('Recipient creation response:', recipientData);

      if (!recipientData.status) {
        throw new Error(recipientData.message || 'Failed to create transfer recipient');
      }

      recipient = recipientData.data.recipient_code;
    }

    // Initiate transfer
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(amount * 100), // Convert to kobo
        recipient: recipient,
        reference: reference,
        reason: 'Withdrawal from Yield platform'
      }),
    });

    const transferData = await transferResponse.json();
    console.log('Transfer response:', transferData);

    if (transferData.status) {
      return new Response(
        JSON.stringify({
          success: true,
          data: transferData.data,
          message: 'Transfer initiated successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: transferData.message || 'Transfer failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

  } catch (error) {
    console.error('Error processing Paystack transfer:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
