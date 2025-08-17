import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook verification endpoint called');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Handle both verification requests and test requests
    let requestData = {};
    try {
      const body = await req.text();
      console.log('Body:', body);
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (e) {
      console.log('No JSON body or empty body');
    }

    const { transaction_id, tx_ref } = requestData as any;

    // If no transaction details provided, return test response
    if (!transaction_id && !tx_ref) {
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Webhook verification endpoint is working',
        timestamp: new Date().toISOString(),
        endpoint: 'flutterwave-verify',
        webhook_url: 'https://stehjqdbncykevpokcvj.supabase.co/functions/v1/flutterwave-webhook',
        verification_url: 'https://stehjqdbncykevpokcvj.supabase.co/functions/v1/flutterwave-verify'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Verifying payment:", { transaction_id, tx_ref });

    // Verify payment with Flutterwave
    const verifyUrl = transaction_id 
      ? `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    const verificationResult = await response.json();

    if (!response.ok) {
      console.error("Flutterwave verification error:", verificationResult);
      return new Response(
        JSON.stringify({ 
          error: "Payment verification failed", 
          details: verificationResult.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentData = verificationResult.data;
    
    // Update payment record in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const updateData = {
      status: paymentData.status,
      flutterwave_id: paymentData.id,
      amount_settled: paymentData.amount_settled || paymentData.amount,
      processor_response: paymentData.processor_response,
      payment_method: paymentData.payment_type,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedTransaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update(updateData)
      .eq("transaction_ref", paymentData.tx_ref)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle successful payment based on payment type
    if (paymentData.status === "successful") {
      const paymentType = updatedTransaction.payment_type;

      if (paymentType === "campaign_funding") {
        // Update campaign budget
        await supabase
          .from("campaigns")
          .update({
            funded_amount: supabase.sql`funded_amount + ${paymentData.amount}`,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedTransaction.campaign_id);

        console.log("Campaign funded successfully:", updatedTransaction.campaign_id);
      }

      if (paymentType === "task_payment") {
        // Credit user account for task completion
        await supabase.rpc("credit_user_account", {
          user_id: updatedTransaction.user_id,
          amount: paymentData.amount,
          reference: `task_payment_${updatedTransaction.task_id}`,
        });

        console.log("Task payment credited:", updatedTransaction.task_id);
      }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: updatedTransaction.user_id,
        title: "Payment Successful",
        content: `Your payment of ${paymentData.currency} ${paymentData.amount} has been processed successfully.`,
        type: "payment_success",
        created_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Payment verified successfully",
        data: {
          transaction_ref: paymentData.tx_ref,
          status: paymentData.status,
          amount: paymentData.amount,
          currency: paymentData.currency,
          payment_method: paymentData.payment_type,
          customer: paymentData.customer,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});