
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate password reset link with proper redirect
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://yeildsocials.com'}/reset-password`
      }
    })

    if (error) {
      console.error('Error generating reset link:', error)
      throw error
    }

    // Send email with Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      throw new Error('Email service not configured')
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your YIELD Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #FFD700; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">YIELD</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Reset Your Password</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #000000; font-size: 24px; margin: 0 0 20px 0;">Password Reset Request</h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your YIELD account. Click the button below to create a new password:
              </p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.properties?.action_link}" 
                   style="display: inline-block; background-color: #FFD700; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                This link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2024 YIELD. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YIELD <noreply@yeildsocials.com>',
        to: [email],
        subject: 'Reset Your YIELD Password',
        html: emailHtml,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        resetLink: data.properties?.action_link 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send password reset email',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
