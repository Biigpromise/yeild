import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  email: string;
  code: string;
  type: 'signup' | 'signin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type }: VerifyCodeRequest = await req.json();

    if (!email || !code || !type) {
      return new Response(
        JSON.stringify({ error: 'Email, code, and type are required' }),
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

    console.log('Verifying code for email:', email, 'type:', type);

    // Find the verification code - first check if it exists
    const { data: existingCode, error: existingError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .maybeSingle();

    if (existingError) {
      console.error('Database error:', existingError);
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!existingCode) {
      console.log('Verification code not found');
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if already verified
    if (existingCode.verified_at) {
      console.log('Code already verified, checking for existing magic link');
      
      // For signin, if already verified, generate a new magic link
      if (type === 'signin') {
        try {
          const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
              redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/`
            }
          });

          if (!linkError && magicLink) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                token: existingCode.token,
                magicLink: magicLink.properties?.action_link,
                message: 'Code already verified, signing you in...',
                alreadyVerified: true
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
              }
            );
          }
        } catch (linkError) {
          console.error('Error generating new magic link:', linkError);
        }
      }
      
      return new Response(
        JSON.stringify({ error: 'This verification code has already been used. Please request a new one.' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if expired
    if (new Date(existingCode.expires_at) < new Date()) {
      console.log('Verification code expired');
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if used
    if (existingCode.used_at) {
      console.log('Verification code already used');
      return new Response(
        JSON.stringify({ error: 'This verification code has already been used. Please request a new one.' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Increment attempt count
    await supabase
      .from('email_verification_codes')
      .update({ 
        attempt_count: (existingCode.attempt_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCode.id);

    const verificationCode = existingCode;

    // Check attempt limit
    if (verificationCode.attempt_count >= 5) {
      console.log('Too many attempts for verification code');
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
      .from('email_verification_codes')
      .update({ 
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationCode.id);

    if (updateError) {
      console.error('Error updating verification code:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify code' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Verification code verified successfully');

    // For signin, create a magic link for auto sign-in
    if (type === 'signin') {
      try {
        // Generate a magic link for auto sign-in
        const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/`
          }
        });

        if (!linkError && magicLink) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              token: verificationCode.token,
              magicLink: magicLink.properties?.action_link,
              message: 'Code verified successfully' 
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
      } catch (linkError) {
        console.error('Error generating magic link:', linkError);
        // Continue without magic link
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        token: verificationCode.token,
        message: 'Code verified successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in verify-signup-code function:', error);
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