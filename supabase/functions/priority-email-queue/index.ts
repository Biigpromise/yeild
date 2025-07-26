
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailQueueItem {
  to: string;
  subject: string;
  html: string;
  priority: 'high' | 'medium' | 'low';
  email_type: string;
  retry_count?: number;
  max_retries?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emails }: { emails: EmailQueueItem[] } = await req.json()
    
    if (!emails || !Array.isArray(emails)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email queue format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Sort emails by priority (high first)
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    emails.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    const results = []

    // Process all high-priority emails immediately with minimal delay
    const highPriorityEmails = emails.filter(email => email.priority === 'high')
    
    // Use Promise.all for parallel processing of high-priority emails
    const highPriorityPromises = highPriorityEmails.map(async (email, index) => {
      try {
        // Stagger requests by 50ms to avoid rate limits while maintaining speed
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        console.log(`Sending high-priority ${email.email_type} email to:`, email.to)

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'YIELD <noreply@yeildsocials.com>',
            to: [email.to],
            subject: email.subject,
            html: email.html,
            tags: [
              { name: 'category', value: email.email_type },
              { name: 'priority', value: email.priority },
              { name: 'domain', value: 'yeildsocials.com' }
            ],
            // Add high priority headers for faster processing
            headers: {
              'X-Priority': '1',
              'X-MSMail-Priority': 'High',
              'Importance': 'high'
            }
          }),
        })

        const emailResult = await emailResponse.json()

        if (emailResponse.ok) {
          // Log successful delivery
          await supabaseClient
            .from('email_delivery_logs')
            .insert({
              email: email.to,
              email_type: email.email_type,
              status: 'sent',
              sent_at: new Date().toISOString()
            })

          return {
            email: email.to,
            status: 'sent',
            id: emailResult.id
          }
        } else {
          throw new Error(`Resend error: ${JSON.stringify(emailResult)}`)
        }
      } catch (error) {
        console.error(`Failed to send email to ${email.to}:`, error)
        
        // Log failed delivery
        await supabaseClient
          .from('email_delivery_logs')
          .insert({
            email: email.to,
            email_type: email.email_type,
            status: 'failed',
            error_message: error.message,
            failed_at: new Date().toISOString()
          })

        return {
          email: email.to,
          status: 'failed',
          error: error.message
        }
      }
    })

    // Wait for all high-priority emails to complete
    const highPriorityResults = await Promise.all(highPriorityPromises)
    results.push(...highPriorityResults)

    // Queue medium and low priority emails for background processing
    const backgroundEmails = emails.filter(email => email.priority !== 'high')
    if (backgroundEmails.length > 0) {
      // Store in queue table for background processing
      await supabaseClient
        .from('email_queue')
        .insert(backgroundEmails.map(email => ({
          to_email: email.to,
          subject: email.subject,
          html_content: email.html,
          priority: email.priority,
          email_type: email.email_type,
          status: 'queued',
          created_at: new Date().toISOString()
        })))

      results.push({
        message: `${backgroundEmails.length} emails queued for background processing`
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results,
        performance: {
          high_priority_emails: highPriorityEmails.length,
          processing_time: `${Date.now()} ms`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email queue processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process email queue',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
