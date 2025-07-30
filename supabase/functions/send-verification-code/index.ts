import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCodeRequest {
  email: string;
  type: 'signup' | 'signin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: SendCodeRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: 'Email and type are required' }),
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

    console.log('Sending verification code for email:', email, 'type:', type);

    // Check if user exists for signin
    if (type === 'signin') {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing user for signin:', checkError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify email address' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
        
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'No account found with this email address' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    // Check if user already exists for signup
    if (type === 'signup') {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing user for signup:', checkError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify email address' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
        
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'An account with this email already exists' }),
          { 
            status: 409, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_verification_codes');

    // Check for recent code (rate limiting)
    const { data: recentCode } = await supabase
      .from('email_verification_codes')
      .select('created_at')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // 1 minute
      .maybeSingle();

    if (recentCode) {
      return new Response(
        JSON.stringify({ error: 'Please wait before requesting another code' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate verification code and token
    const { data: codeResult } = await supabase.rpc('generate_verification_code');
    const code = codeResult;
    const token = crypto.randomUUID();

    // Store verification code
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        email,
        verification_code: code,
        token,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification code' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Send email with verification code
    const subject = type === 'signup' ? 'Your Sign Up Verification Code' : 'Your Sign In Verification Code';
    const action = type === 'signup' ? 'complete your registration' : 'sign in to your account';
    
    // Send email with verification code
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "yeildsocials <noreply@yeildsocials.com>",
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Verification Code</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Your verification code to ${action} is:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: #f5f5f5; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; display: inline-block;">
              ${code}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`
    });
    
    // Also log for development debugging
    console.log(`✅ Verification code for ${email}: ${code}`);

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Verification code sent successfully:', emailResult?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        token // Return token for verification
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-verification-code function:', error);
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