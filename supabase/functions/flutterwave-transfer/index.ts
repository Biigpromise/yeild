import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  account_bank: string;
  account_number: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  reference: string;
  narration: string;
  meta?: {
    user_id?: string;
    withdrawal_id?: string;
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

    // Verify admin access
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

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .rpc("get_user_role_safe", { user_id_param: user.id });

    if (userRole !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transferData: TransferRequest = await req.json();

    // Validate required fields
    if (!transferData.account_bank || !transferData.account_number || !transferData.amount) {
      return new Response(
        JSON.stringify({ error: "Missing required transfer fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transferPayload = {
      account_bank: transferData.account_bank,
      account_number: transferData.account_number,
      amount: transferData.amount,
      currency: transferData.currency || "NGN",
      beneficiary_name: transferData.beneficiary_name,
      reference: transferData.reference || `transfer_${Date.now()}`,
      narration: transferData.narration || "YIELD Platform Payout",
      callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flutterwave-webhook`,
      meta: transferData.meta || {},
    };

    console.log("Initiating Flutterwave transfer:", { reference: transferPayload.reference, amount: transferData.amount });

    const response = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transferPayload),
    });

    const flutterwaveResponse = await response.json();

    if (!response.ok) {
      console.error("Flutterwave transfer error:", flutterwaveResponse);
      return new Response(
        JSON.stringify({ 
          error: "Transfer initialization failed", 
          details: flutterwaveResponse.message || "Unknown error" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store transfer record in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseService.from("payout_transactions").insert({
      user_id: transferData.meta?.user_id,
      withdrawal_id: transferData.meta?.withdrawal_id,
      task_id: transferData.meta?.task_id,
      reference: transferPayload.reference,
      amount: transferData.amount,
      currency: transferData.currency || "NGN",
      status: "pending",
      flutterwave_id: flutterwaveResponse.data?.id,
      account_bank: transferData.account_bank,
      account_number: transferData.account_number,
      beneficiary_name: transferData.beneficiary_name,
      narration: transferData.narration,
      created_at: new Date().toISOString(),
    });

    // Update withdrawal request status if applicable
    if (transferData.meta?.withdrawal_id) {
      await supabaseService
        .from("withdrawal_requests")
        .update({
          status: "processing",
          processed_at: new Date().toISOString(),
          admin_notes: `Transfer initiated with reference: ${transferPayload.reference}`,
        })
        .eq("id", transferData.meta.withdrawal_id);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Transfer initiated successfully",
        data: {
          reference: transferPayload.reference,
          flutterwave_id: flutterwaveResponse.data?.id,
          amount: transferData.amount,
          currency: transferData.currency || "NGN",
          status: flutterwaveResponse.data?.status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Transfer initiation error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});