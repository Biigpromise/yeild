
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name?: string;
  confirmationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationCode }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation code to:", email);

    const emailResponse = await resend.emails.send({
      from: "YEILD <noreply@yeildsocials.com>",
      to: [email],
      subject: "Your YEILD Confirmation Code 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FFD700; font-size: 36px; margin: 0;">YEILD</h1>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #FFD700; margin-top: 0;">Confirm Your Account${name ? `, ${name}` : ''}! 🚀</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome to YEILD! Please use the confirmation code below to verify your account:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #FFD700; color: #000000; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
                ${confirmationCode}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #cccccc; margin-bottom: 10px; text-align: center;">
              Enter this code in the YEILD app to complete your registration.
            </p>
            
            <p style="font-size: 14px; color: #cccccc; margin-top: 20px;">
              This confirmation code will expire in 15 minutes for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #888888;">
            <p>You're receiving this email because you signed up for YEILD.</p>
            <p style="margin: 10px 0;">
              <strong>YEILD</strong> - Your gateway to earning online
            </p>
            <p style="margin-top: 15px; color: #666666;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-signup-confirmation function:", error);
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
