import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Flutterwave secret key from environment variables - NO FALLBACK for security
    const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    
    if (!flutterwaveSecretKey) {
      return new Response(
        JSON.stringify({ 
          error: "Flutterwave secret key not configured",
          configured: false,
          mode: "UNCONFIGURED"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isLiveMode = flutterwaveSecretKey.startsWith("FLWSECK-");
    
    return new Response(
      JSON.stringify({
        mode: isLiveMode ? "LIVE" : "TEST",
        configured: true,
        message: isLiveMode ? "Live keys are active" : "Test keys are active",
        keyPrefix: flutterwaveSecretKey.substring(0, 10) + "..."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error checking Flutterwave configuration:", error);
    return new Response(
      JSON.stringify({ 
        error: "Configuration check failed", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});