import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Password reset email function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    console.log('Processing password reset for email:', email);

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate custom password reset token and 6-digit code
    const resetToken = crypto.randomUUID();
    const { data: resetCode } = await supabaseAdmin.rpc('generate_reset_code');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Check if user exists by querying profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.log('User not found in profiles:', email);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No account found with this email address. Please check your email or sign up for a new account.',
          code: 'USER_NOT_FOUND'
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const user = { id: profile.id };

    // Store the reset token and code in database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email: email,
        token: resetToken,
        reset_code: resetCode,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      throw tokenError;
    }

    console.log('Generated custom reset token and code successfully');

    // Send the password reset email
    const emailResponse = await resend.emails.send({
      from: "Yeildsocials <noreply@yeildsocials.com>",
      to: [email],
      subject: "🔐 Your Yeildsocials Password Reset Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Yeildsocials Password Reset Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Code</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your verification code is ready</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Here's your 6-digit verification code to reset your Yeildsocials password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; 
                          border: 2px dashed #667eea; 
                          padding: 20px; 
                          border-radius: 8px; 
                          display: inline-block;">
                <div style="font-size: 36px; 
                           font-weight: bold; 
                           letter-spacing: 8px; 
                           color: #667eea; 
                           font-family: 'Courier New', monospace;">
                  ${resetCode}
                </div>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin: 20px 0;">
              <strong>This code expires in 10 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't be changed unless you enter this code.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              For security, this code will expire in 10 minutes.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Best regards,<br>
              <strong>The Yeildsocials Team</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
              © 2024 Yeildsocials. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('Password reset email sent successfully:', emailResponse.data?.id);

    // Log the activity
    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: null, // We don't have user ID from email alone
          activity_type: 'password_reset_email_sent',
          activity_data: {
            email: email,
            email_id: emailResponse.data?.id,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
      // Don't fail the request for logging errors
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully",
        email_id: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send password reset email",
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);