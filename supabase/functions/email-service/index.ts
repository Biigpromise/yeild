
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'password_reset' | 'email_verification' | 'welcome' | 'test';
  email: string;
  data?: {
    resetUrl?: string;
    confirmationUrl?: string;
    name?: string;
    company?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured. Please contact administrator.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendApiKey);
    const { type, email, data = {} }: EmailRequest = await req.json();

    console.log(`Processing ${type} email for:`, email);

    // Handle test request
    if (type === 'test') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email service is properly configured',
        configured: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let emailContent = { subject: '', html: '', from: 'YIELD <noreply@yeildsocials.com>' };

    switch (type) {
      case 'password_reset':
        emailContent = {
          ...emailContent,
          subject: 'Reset Your Password - YIELD',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset - YIELD</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Reset your YIELD account password</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We received a request to reset your password for your YIELD account. Click the button below to create a new password.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.resetUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    Reset Password
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If the button doesn't work, you can also copy and paste this link into your browser:
                </p>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
                  <a href="${data.resetUrl}" style="color: #667eea;">${data.resetUrl}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours for security reasons.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Best regards,<br>
                  <strong>The YIELD Team</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                  © 2024 YIELD. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `
        };
        break;

      case 'email_verification':
        emailContent = {
          ...emailContent,
          subject: 'Verify Your Email - YIELD',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Verification - YIELD</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YIELD!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Verify your email to get started</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Welcome ${data.name || 'to YIELD'}! Please verify your email address to complete your registration and start earning.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.confirmationUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    Verify Email
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  If the button doesn't work, you can also copy and paste this link into your browser:
                </p>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
                  <a href="${data.confirmationUrl}" style="color: #667eea;">${data.confirmationUrl}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
                <ul style="color: #666; font-size: 14px;">
                  <li>Complete your profile setup</li>
                  <li>Start earning points by completing tasks</li>
                  <li>Refer friends and build your network</li>
                  <li>Join our community chat</li>
                </ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  This verification link will expire in 24 hours.
                </p>
                <p style="color: #666; font-size: 14px;">
                  If you didn't create this account, you can safely ignore this email.
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Best regards,<br>
                  <strong>The YIELD Team</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                  © 2024 YIELD. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `
        };
        break;

      case 'welcome':
        emailContent = {
          ...emailContent,
          subject: `Welcome to YIELD${data.company ? ` - ${data.company}` : ''}!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome - YIELD</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YIELD!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your journey starts here</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #333; margin-top: 0;">Hello ${data.name || 'there'}!</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Your account has been successfully verified and you're now part of the YIELD community! 🎉
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h3 style="color: #667eea; margin-top: 0;">What's Next?</h3>
                  <ul style="color: #666; margin-bottom: 0;">
                    <li>Complete your profile setup</li>
                    <li>Start connecting with other users</li>
                    <li>Explore available tasks and campaigns</li>
                    <li>Begin earning rewards and points</li>
                    <li>Join our community chat</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://yeildsocials.com/dashboard" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    Get Started
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="color: #666; font-size: 14px;">
                  If you have any questions or need assistance, feel free to reach out to our support team.
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Best regards,<br>
                  <strong>The YIELD Team</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                  © 2024 YIELD. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `
        };
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: emailContent.from,
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
      tags: [type, 'yeildsocials'],
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(emailResponse.error.message || 'Failed to send email');
    }

    // Log successful email
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('email_delivery_logs')
      .insert({
        email,
        email_type: type,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    console.log(`${type} email sent successfully to:`, email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${type} email sent successfully`,
      id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Email service error:', error);
    
    // Log failed email attempt
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('email_delivery_logs')
        .insert({
          email: 'unknown@example.com',
          email_type: 'unknown',
          status: 'failed',
          error_message: error.message,
          failed_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
