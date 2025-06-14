
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Payment verification failed');
    }

    // If payment is successful, update user points
    if (result.status && result.data.status === 'success') {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const amountInNaira = result.data.amount / 100; // Convert from kobo
      const pointsToAdd = Math.floor(amountInNaira / 10); // 1 point per ₦10

      // Get user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', result.data.customer.email)
        .single();

      if (profiles) {
        // Add points to user account
        await supabase
          .from('profiles')
          .update({ 
            points: supabase.rpc('increment', { x: pointsToAdd }) 
          })
          .eq('id', profiles.id);

        // Record transaction
        await supabase
          .from('point_transactions')
          .insert({
            user_id: profiles.id,
            points: pointsToAdd,
            transaction_type: 'purchase',
            reference_id: reference,
            description: `Points purchased via Paystack - ₦${amountInNaira.toLocaleString()}`
          });
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Paystack verification error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Payment verification failed' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
