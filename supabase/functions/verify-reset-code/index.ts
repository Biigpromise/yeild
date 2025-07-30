import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyCodeRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Verifying reset code for email:', email);

    // Find the reset token by email and code
    const { data: resetToken, error: findError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('reset_code', code)
      .is('used_at', null)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (findError || !resetToken) {
      console.log('Reset code not found or expired');
      
      // Increment attempt count if token exists
      await supabase
        .from('password_reset_tokens')
        .update({ 
          attempt_count: supabase.raw('attempt_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('reset_code', code);

      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check attempt limit
    if (resetToken.attempt_count >= 5) {
      console.log('Too many attempts for reset code');
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Mark the code as verified
    const { error: updateError } = await supabase
      .from('password_reset_tokens')
      .update({ 
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.id);

    if (updateError) {
      console.error('Error updating reset token:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify code' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Reset code verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        token: resetToken.token,
        message: 'Code verified successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in verify-reset-code function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);