
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

    console.log("Sending verification email to:", email);
    console.log("Confirmation URL:", confirmationUrl);

    // Validate input
    if (!email || !confirmationUrl) {
      console.error("Missing required fields:", { email: !!email, confirmationUrl: !!confirmationUrl });
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
      from: "YEILD <noreply@yeildsocials.com>",
      to: [email],
      subject: "✅ Verify your YEILD account - Action Required",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your YEILD Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YEILD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Hi ${displayName}, let's verify your account</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for signing up with YEILD! To complete your registration and access your account, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Verify My Account
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
              <a href="${confirmationUrl}" style="color: #667eea;">${confirmationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; font-size: 14px;">
              <li>Complete your profile setup</li>
              <li>Start earning points by completing tasks</li>
              <li>Invite friends and earn referral bonuses</li>
              <li>Redeem your points for rewards</li>
            </ul>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you didn't create this account, please ignore this email or contact our support team.
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
      text: `
Welcome to YEILD, ${displayName}!

Thank you for signing up! To complete your registration, please verify your email address by visiting this link:

${confirmationUrl}

What's Next?
- Complete your profile setup
- Start earning points by completing tasks
- Invite friends and earn referral bonuses
- Redeem your points for rewards

If you didn't create this account, please ignore this email.

Best regards,
The YEILD Team
      `.trim(),
    });

    console.log("Resend API response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(emailResponse.error.message || "Failed to send email");
    }

    // Log email send attempt with correct column name
    try {
      await supabaseClient.from('user_activity_logs').insert({
        user_id: null, // No user ID yet since they're not verified
        action: 'email_verification_sent',
        activity_data: {
          email: email,
          timestamp: new Date().toISOString(),
          email_id: emailResponse.data?.id,
          resend_response: emailResponse.data
        }
      });
      console.log("Activity logged successfully");
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the email send if logging fails
    }

    console.log("Verification email sent successfully:", emailResponse.data);

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
