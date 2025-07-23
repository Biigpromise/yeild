
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  name: string;
  title: string;
  description: string;
  redirect_url: string;
  meta?: {
    user_id?: string;
    payment_type?: string;
    campaign_id?: string;
    task_id?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentData: PaymentRequest = await req.json();

    if (!paymentData.amount || !paymentData.currency || !paymentData.email || !paymentData.name) {
      return new Response(
        JSON.stringify({ error: "Missing required payment fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tx_ref = `flw_${Date.now()}_${user.id.slice(0, 8)}`;

    const flutterwavePayload = {
      tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      redirect_url: paymentData.redirect_url,
      payment_options: "card,mobilemoney,ussd,banktransfer",
      customer: {
        email: paymentData.email,
        phone_number: paymentData.phone_number,
        name: paymentData.name,
      },
      customizations: {
        title: paymentData.title,
        description: paymentData.description,
        logo: "https://stehjqdbncykevpokcvj.supabase.co/storage/v1/object/public/profile-pictures/logo.png",
      },
      meta: {
        user_id: user.id,
        payment_type: paymentData.meta?.payment_type || "general",
        campaign_id: paymentData.meta?.campaign_id,
        task_id: paymentData.meta?.task_id,
      },
    };

    // Get the Flutterwave secret key
    const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    
    if (!flutterwaveSecretKey) {
      console.error("Flutterwave secret key not found");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we're using live or test mode based on the key
    const isLiveMode = flutterwaveSecretKey.startsWith("FLWSECK-");
    const apiUrl = "https://api.flutterwave.com/v3/payments";

    console.log(`Initiating Flutterwave payment (${isLiveMode ? 'LIVE' : 'TEST'} mode):`, { 
      tx_ref, 
      amount: paymentData.amount,
      mode: isLiveMode ? 'LIVE' : 'TEST'
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flutterwavePayload),
    });

    const flutterwaveResponse = await response.json();

    if (!response.ok) {
      console.error("Flutterwave API error:", flutterwaveResponse);
      return new Response(
        JSON.stringify({ 
          error: "Payment initialization failed", 
          details: flutterwaveResponse.message || "Unknown error" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseService.from("payment_transactions").insert({
      user_id: user.id,
      transaction_ref: tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_type: paymentData.meta?.payment_type || "general",
      status: "pending",
      flutterwave_id: flutterwaveResponse.data?.id,
      campaign_id: paymentData.meta?.campaign_id,
      task_id: paymentData.meta?.task_id,
      customer_email: paymentData.email,
      customer_name: paymentData.name,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Payment initiated successfully",
        mode: isLiveMode ? 'LIVE' : 'TEST',
        data: {
          link: flutterwaveResponse.data.link,
          payment_link: flutterwaveResponse.data.link,
          tx_ref,
          amount: paymentData.amount,
          currency: paymentData.currency,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Payment initialization error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
