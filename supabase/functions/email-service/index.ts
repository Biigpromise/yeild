import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'password_reset' | 'email_verification' | 'welcome';
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
    const { type, email, data = {} }: EmailRequest = await req.json();

    console.log(`Processing ${type} email for:`, email);

    let emailContent = { subject: '', html: '', from: 'Yield Socials <noreply@yeildsocials.com>' };

    switch (type) {
      case 'password_reset':
        emailContent = {
          ...emailContent,
          subject: 'Reset Your Password - Yield Socials',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset - Yield Socials</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                <p>We received a request to reset your password for your Yield Socials account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours for security reasons.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Yield Socials - Connect, Create, Earn<br>
                  <a href="https://yeildsocials.com" style="color: #667eea;">yeildsocials.com</a>
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
          subject: 'Verify Your Email - Yield Socials',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Verification - Yield Socials</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Yield Socials!</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
                <p>Welcome ${data.name || 'to Yield Socials'}! Please verify your email address to complete your registration.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.confirmationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
                </div>
                
                <p style="color: #666; font-size: 14px;">This verification link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Yield Socials - Connect, Create, Earn<br>
                  <a href="https://yeildsocials.com" style="color: #667eea;">yeildsocials.com</a>
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
          subject: `Welcome to Yield Socials${data.company ? ` - ${data.company}` : ''}!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome - Yield Socials</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Yield Socials!</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hello ${data.name || 'there'}!</h2>
                <p>Your account has been successfully verified and you're now part of the Yield Socials community!</p>
                
                <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #667eea; margin-top: 0;">What's Next?</h3>
                  <ul style="color: #666;">
                    <li>Complete your profile setup</li>
                    <li>Start connecting with other users</li>
                    <li>Explore available tasks and campaigns</li>
                    <li>Begin earning rewards</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://yeildsocials.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Yield Socials - Connect, Create, Earn<br>
                  <a href="https://yeildsocials.com" style="color: #667eea;">yeildsocials.com</a>
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
      tags: [type, 'production'],
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(emailResponse.error.message || 'Failed to send email');
    }

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