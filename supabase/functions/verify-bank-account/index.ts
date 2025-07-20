
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccountVerificationRequest {
  account_number: string;
  account_bank: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { account_number, account_bank }: AccountVerificationRequest = await req.json();

    if (!account_number || !account_bank) {
      return new Response(
        JSON.stringify({ error: "Account number and bank code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying account:", { account_number, account_bank });

    const response = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number,
        account_bank
      }),
    });

    const flutterwaveResponse = await response.json();

    if (!response.ok) {
      console.error("Flutterwave verification error:", flutterwaveResponse);
      return new Response(
        JSON.stringify({ 
          error: "Account verification failed", 
          details: flutterwaveResponse.message || "Unknown error" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (flutterwaveResponse.status === "success" && flutterwaveResponse.data) {
      return new Response(
        JSON.stringify({
          status: "success",
          data: {
            account_name: flutterwaveResponse.data.account_name,
            account_number: flutterwaveResponse.data.account_number
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: "Account verification failed", 
          details: "Invalid account details" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Account verification error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
