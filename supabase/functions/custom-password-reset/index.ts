import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Processing password reset request for:', email);

    // Check if user exists in auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${email}`
    });
    
    if (authError || !users || users.length === 0) {
      console.log('User not found in auth system:', email);
      // Return success anyway to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true, message: 'If the email exists, a reset link has been sent' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const authUser = users[0];

    // Generate secure token
    const resetToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Clean up ALL existing tokens for this email to prevent confusion
    console.log('Cleaning up all old tokens for:', email);
    const { error: cleanupError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email);

    if (cleanupError) {
      console.error('Error cleaning up old tokens:', cleanupError);
      // Continue anyway - this is not critical
    } else {
      console.log('Successfully cleaned up all old tokens for email');
    }

    // Store reset token in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: authUser.id,
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing reset token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset token' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create reset link - use your custom domain first, fallback to origin
    const baseUrl = 'https://yeildsocials.com';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log('Generated reset URL:', resetUrl);

    // Validate email parameters before sending
    if (!email || !email.includes('@')) {
      console.error('Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email via Resend (simplified version to avoid validation errors)
    console.log('Sending password reset email to:', email);
    console.log('Using simplified email format...');
    
    const emailResponse = await resend.emails.send({
      from: 'YIELD <noreply@yeildsocials.com>',
      to: [email],
      subject: 'Reset Your YIELD Password',
      html: `<h2>Reset Your Password</h2>
<p>We received a request to reset your password for your YIELD account.</p>
<p><a href="${resetUrl}">Click here to reset your password</a></p>
<p>This link will expire in 1 hour for security reasons.</p>
<p>If you didn't request this password reset, you can safely ignore this email.</p>`
    });

    if (emailResponse.error) {
      console.error('Resend error details:', {
        error: emailResponse.error,
        statusCode: emailResponse.error?.statusCode,
        name: emailResponse.error?.name,
        message: emailResponse.error?.message
      });
      
      // Check if it's a domain verification issue
      if (emailResponse.error?.message?.includes('Invalid') || emailResponse.error?.statusCode === 422) {
        console.error('Possible domain verification issue. Trying with default domain...');
        
        // Fallback to default domain
        const fallbackResponse = await resend.emails.send({
          from: 'YIELD <onboarding@resend.dev>',
          to: [email],
          subject: 'Reset Your YIELD Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #333; font-size: 24px;">Reset Your Password</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                  We received a request to reset your password for your YIELD account.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 1 hour for security reasons.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this password reset, you can safely ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #999; font-size: 12px;">
                  © 2024 YIELD. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });
        
        if (fallbackResponse.error) {
          console.error('Fallback email also failed:', fallbackResponse.error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to send reset email',
              details: 'Both custom domain and fallback failed'
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        } else {
          console.log('Fallback email sent successfully');
        }
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send reset email',
            details: emailResponse.error.message || 'Unknown email service error'
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    console.log('Password reset email sent successfully to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        email_id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);