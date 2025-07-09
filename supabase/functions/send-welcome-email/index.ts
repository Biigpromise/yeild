
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "YEILD <noreply@yeildsocials.com>",
      to: [email],
      subject: "Welcome to YEILD! Start Earning Today 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FFD700; font-size: 36px; margin: 0;">YEILD</h1>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #FFD700; margin-top: 0;">Welcome to YEILD${name ? `, ${name}` : ''}! 🎉</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining our community! You're now part of thousands of users who are earning money by completing simple tasks.
            </p>
            
            <div style="background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFD700; margin-top: 0;">Get Started in 3 Easy Steps:</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Complete your profile setup</li>
                <li style="margin-bottom: 10px;">Browse available tasks</li>
                <li style="margin-bottom: 10px;">Start earning points and cash!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yeildsocials.com/dashboard" 
                 style="background-color: #FFD700; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #cccccc; margin-bottom: 0;">
              Ready to start earning? Your dashboard is waiting for you!
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #888888;">
            <p>You're receiving this email because you signed up for YEILD.</p>
            <p style="margin: 10px 0;">
              <strong>YEILD</strong> - Your gateway to earning online
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
