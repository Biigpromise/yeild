import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info',
};

interface SendCodeRequest {
  email: string;
  type: 'signup' | 'signin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, message: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return new Response(
        JSON.stringify({ success: false, message: 'Email service configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const { email, type }: SendCodeRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and type are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Sending verification code for email:', email, 'type:', type);

    // Check if user exists for signin
    if (type === 'signin') {
      console.log('Checking if user exists for signin:', email);
      const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
      
      if (checkError) {
        console.error('Error checking existing user for signin:', checkError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to verify email address' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      const existingUser = existingUsers.users.find(user => user.email === email);
      
      if (!existingUser) {
        console.log('User not found for signin:', email);
        return new Response(
          JSON.stringify({ success: false, message: 'No account found with this email address' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      console.log('User found for signin:', existingUser.id);
    }

    // Check if user already exists for signup
    if (type === 'signup') {
      console.log('Checking if user already exists for signup:', email);
      const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
      
      if (checkError) {
        console.error('Error checking existing user for signup:', checkError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to verify email address' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      const existingUser = existingUsers.users.find(user => user.email === email);
      
      if (existingUser) {
        console.log('User already exists for signup:', email);
        return new Response(
          JSON.stringify({ success: false, message: 'An account with this email already exists' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      console.log('User does not exist - good for signup:', email);
    }

    // Clean up expired codes first (with error handling)
    try {
      await supabase.rpc('cleanup_expired_verification_codes');
      console.log('Successfully cleaned up expired verification codes');
    } catch (cleanupError) {
      console.warn('Failed to cleanup expired codes, continuing:', cleanupError);
      // Continue execution - this is not critical
    }

    // Check for recent code (rate limiting)
    const { data: recentCode, error: rateLimitError } = await supabase
      .from('email_verification_codes')
      .select('created_at')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // 1 minute
      .maybeSingle();

    if (rateLimitError) {
      console.error('Error checking rate limit:', rateLimitError);
      // Continue without rate limiting check if database error occurs
    } else if (recentCode) {
      console.log('Rate limit triggered for email:', email);
      return new Response(
        JSON.stringify({ success: false, message: 'Please wait before requesting another code' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate verification code and token with fallback
    let code: string;
    try {
      const { data: codeResult, error: codeError } = await supabase.rpc('generate_verification_code');
      if (codeError) {
        throw new Error(`Database code generation failed: ${codeError.message}`);
      }
      code = codeResult;
      console.log('Generated verification code using database function');
    } catch (codeGenError) {
      console.warn('Database code generation failed, using fallback:', codeGenError);
      // Fallback: generate code locally
      code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated verification code using fallback method');
    }
    
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
        JSON.stringify({ success: false, message: 'Failed to send verification code' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Resend with validated API key
    const resend = new Resend(resendApiKey);
    
    // Send email with verification code
    const subject = type === 'signup' ? 'Your Sign Up Verification Code' : 'Your Sign In Verification Code';
    const action = type === 'signup' ? 'complete your registration' : 'sign in to your account';
    
    console.log('Attempting to send email via Resend...');
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Yeildsocials <noreply@yeildsocials.com>",
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
        JSON.stringify({ success: false, message: 'Failed to send verification email' }),
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
      JSON.stringify({ success: false, message: 'Something went wrong' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);