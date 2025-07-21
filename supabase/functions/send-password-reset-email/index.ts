
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password reset email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl, name }: PasswordResetRequest = await req.json();
    console.log("Sending password reset email to:", email);

    const emailResponse = await resend.emails.send({
      from: "YEILD <noreply@yeildsocials.com>",
      to: [email],
      subject: "Reset Your YEILD Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #F4D03F; font-size: 32px; font-weight: bold; margin: 0;">YEILD</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="margin-bottom: 20px;">Hello${name ? ` ${name}` : ''},</p>
            <p style="margin-bottom: 20px;">We received a request to reset your password for your YEILD account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #F4D03F; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="margin-bottom: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-size: 14px;">${resetUrl}</p>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
            <p>© 2024 YEILD. All rights reserved.</p>
            <p>Keep earning, keep growing!</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
