
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3.4.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, companyName } = await req.json()
    
    console.log("Sending brand confirmation email to:", email, "Company:", companyName);
    
    if (!email || !companyName) {
      console.error("Missing required fields:", { email: !!email, companyName: !!companyName });
      return new Response(JSON.stringify({ error: 'Email and companyName are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Create a Supabase client with the service role key to generate links
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a magic link for the user to sign in and confirm their email
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'https://yeildsocials.com/brand-dashboard'
      }
    })

    if (linkError) {
      console.error("Failed to generate magic link:", linkError);
      throw linkError;
    }
    
    const magicLink = linkData.properties.action_link;
    console.log("Generated magic link for brand:", magicLink);

    // Send the email using Resend with your verified domain
    const emailResponse = await resend.emails.send({
      from: 'YEILD <noreply@yeildsocials.com>',
      to: [email],
      subject: '✅ Confirm your YEILD brand account - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your YEILD Brand Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to YEILD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Hi ${companyName}, let's get you started</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for signing up with YEILD as a brand partner! To complete your registration and access your brand dashboard, please confirm your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Confirm My Account
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; margin: 15px 0;">
              <a href="${magicLink}" style="color: #667eea;">${magicLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; font-size: 14px;">
              <li>Your brand application will be reviewed by our team</li>
              <li>You'll receive an update within 24-48 hours</li>
              <li>Once approved, you can start creating campaigns</li>
              <li>Access advanced analytics and targeting options</li>
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
Welcome to YEILD, ${companyName}!

Thank you for signing up as a brand partner! To complete your registration, please confirm your email address by visiting this link:

${magicLink}

What's Next?
- Your brand application will be reviewed by our team
- You'll receive an update within 24-48 hours  
- Once approved, you can start creating campaigns
- Access advanced analytics and targeting options

If you didn't create this account, please ignore this email.

Best regards,
The YEILD Team
      `.trim(),
    })

    console.log("Resend API response for brand:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error for brand:", emailResponse.error);
      throw new Error(emailResponse.error.message || "Failed to send brand confirmation email");
    }

    // Log the email send attempt
    try {
      await supabaseAdmin.from('user_activity_logs').insert({
        user_id: null,
        action: 'brand_confirmation_email_sent',
        activity_data: {
          email: email,
          company_name: companyName,
          timestamp: new Date().toISOString(),
          email_id: emailResponse.data?.id,
          resend_response: emailResponse.data
        }
      });
      console.log("Brand email activity logged successfully");
    } catch (logError) {
      console.error("Failed to log brand email activity:", logError);
      // Don't fail the email send if logging fails
    }

    console.log("Brand confirmation email sent successfully:", emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Brand confirmation email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-brand-confirmation-email function:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to send brand confirmation email",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
