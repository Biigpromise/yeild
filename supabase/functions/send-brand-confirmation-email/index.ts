
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
    if (!email || !companyName) {
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
    })

    if (linkError) throw linkError
    
    const magicLink = linkData.properties.action_link;

    // Send the email using Resend
    const { data, error: resendError } = await resend.emails.send({
      from: 'Yeild <noreply@yeildsocials.com>',
      to: [email],
      subject: 'Log in to Yeild and confirm your account',
      html: `
        <h1>Welcome, ${companyName}!</h1>
        <p>Thanks for signing up. Please click the magic link below to sign in and confirm your email address.</p>
        <a href="${magicLink}">Sign in to Yeild</a>
        <p>After signing in, your application will be reviewed by our team.</p>
        <p>Best regards,<br>The Yeild Team</p>
      `,
    })

    if (resendError) throw resendError

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-brand-confirmation-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

