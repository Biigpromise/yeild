
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { account_number, account_bank } = await req.json();

    if (!account_number || !account_bank) {
      return new Response(
        JSON.stringify({ error: "Account number and bank code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying account:", { account_number, account_bank });

    // Call Flutterwave account verification endpoint
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
          success: false,
          error: flutterwaveResponse.message || "Account verification failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (flutterwaveResponse.status === "success" && flutterwaveResponse.data) {
      console.log("Account verified successfully:", flutterwaveResponse.data);
      return new Response(
        JSON.stringify({
          success: true,
          account_name: flutterwaveResponse.data.account_name,
          account_number: flutterwaveResponse.data.account_number,
          bank_code: account_bank
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("Account verification failed:", flutterwaveResponse);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: flutterwaveResponse.message || "Account verification failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Account verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
