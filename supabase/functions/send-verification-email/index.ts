import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  name?: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl }: VerificationEmailRequest = await req.json();

    // Validate input
    if (!email || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: "Email and confirmation URL are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client for logging
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const displayName = name || email.split('@')[0];

    const emailResponse = await resend.emails.send({
      from: "YieldSocials <onboarding@resend.dev>",
      to: [email],
      subject: "Please verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
            .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              text-decoration: none; 
              padding: 14px 28px; 
              border-radius: 8px; 
              font-weight: 600;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .cta-button:hover { transform: translateY(-1px); }
            .security-notice { 
              background-color: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 16px; 
              margin: 20px 0; 
              border-radius: 4px;
            }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to YieldSocials!</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello ${displayName},</div>
              <div class="message">
                Thank you for joining YieldSocials! To complete your registration and start earning rewards, 
                please verify your email address by clicking the button below.
              </div>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="cta-button">Verify Email Address</a>
              </div>
              
              <div class="security-notice">
                <strong>Security Notice:</strong> This verification link will expire in 24 hours. 
                If you didn't create an account with YieldSocials, please ignore this email.
              </div>
              
              <div class="message">
                Once verified, you'll be able to:
                <ul>
                  <li>Complete tasks and earn points</li>
                  <li>Refer friends and get bonus rewards</li>
                  <li>Access exclusive features</li>
                  <li>Withdraw your earnings</li>
                </ul>
              </div>
              
              <div class="message" style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
              </div>
            </div>
            <div class="footer">
              <p>Best regards,<br>The YieldSocials Team</p>
              <p>
                <a href="mailto:support@yieldsocials.com">Contact Support</a> | 
                <a href="#">Privacy Policy</a> | 
                <a href="#">Terms of Service</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log email send attempt
    await supabaseClient.from('user_activity_logs').insert({
      user_id: null, // No user ID yet since they're not verified
      activity_type: 'email_verification_sent',
      activity_data: {
        email: email,
        timestamp: new Date().toISOString(),
        email_id: emailResponse.data?.id
      }
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send verification email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);