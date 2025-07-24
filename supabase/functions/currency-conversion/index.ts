import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CurrencyConversionRequest {
  from: string;
  to: string;
  amount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, to, amount }: CurrencyConversionRequest = await req.json();

    if (!from || !to) {
      return new Response(
        JSON.stringify({ error: "Missing currency parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current exchange rate from database
    const { data: rateData, error: rateError } = await supabaseClient
      .from('currency_rates')
      .select('rate, updated_at')
      .eq('from_currency', from.toUpperCase())
      .eq('to_currency', to.toUpperCase())
      .single();

    if (rateError && rateError.code !== 'PGRST116') {
      throw rateError;
    }

    let rate = 1500; // Default USD to NGN rate
    let lastUpdated = new Date().toISOString();

    if (rateData) {
      rate = Number(rateData.rate);
      lastUpdated = rateData.updated_at;
    } else {
      // If no rate found, insert default rate
      await supabaseClient
        .from('currency_rates')
        .insert({
          from_currency: from.toUpperCase(),
          to_currency: to.toUpperCase(),
          rate: rate,
          updated_at: new Date().toISOString()
        });
    }

    // Check if rate is older than 1 hour and update if needed
    const rateAge = Date.now() - new Date(lastUpdated).getTime();
    const oneHour = 60 * 60 * 1000;

    if (rateAge > oneHour) {
      // In a real application, you would fetch from a currency API here
      // For now, we'll keep the existing rate but update the timestamp
      await supabaseClient
        .from('currency_rates')
        .update({ updated_at: new Date().toISOString() })
        .eq('from_currency', from.toUpperCase())
        .eq('to_currency', to.toUpperCase());
      
      lastUpdated = new Date().toISOString();
    }

    const result = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: rate,
      last_updated: lastUpdated,
      converted_amount: amount ? amount * rate : undefined
    };

    return new Response(
      JSON.stringify({
        status: "success",
        data: result
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Currency conversion error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
