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

    // Generate custom password reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Get user ID from email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error('Error fetching users:', userError);
      throw userError;
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Store the reset token in database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      throw tokenError;
    }

    const resetLink = `https://yeildsocials.com/custom-reset-password?token=${resetToken}`;
    console.log('Generated custom reset token successfully');

    // Send the password reset email
    const emailResponse = await resend.emails.send({
      from: "YEILD <noreply@yeildsocials.com>",
      to: [email],
      subject: "🔐 Reset Your YEILD Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your YEILD Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Let's get you back into your YEILD account</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your YEILD password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Reset My Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
              <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't be changed unless you click the link above.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              This link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Best regards,<br>
              <strong>The YEILD Team</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
              © 2024 YEILD. All rights reserved.
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