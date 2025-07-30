import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskAnnouncementEmailRequest {
  announcementId: string;
  emailType: 'interest_notification' | 'launch_notification';
  targetAudience?: 'all' | 'interested_users';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { announcementId, emailType, targetAudience = 'interested_users' }: TaskAnnouncementEmailRequest = await req.json();

    console.log('Processing task announcement email:', { announcementId, emailType, targetAudience });

    // Get announcement details
    const { data: announcement, error: announcementError } = await supabase
      .from('brand_task_announcements')
      .select(`
        *,
        brand_profiles!inner(company_name, logo_url)
      `)
      .eq('id', announcementId)
      .single();

    if (announcementError || !announcement) {
      throw new Error(`Announcement not found: ${announcementError?.message}`);
    }

    let recipientEmails: string[] = [];

    if (targetAudience === 'interested_users') {
      // Get users who showed interest in this announcement
      const { data: interestedUsers, error: usersError } = await supabase
        .from('user_task_interests')
        .select(`
          user_id,
          profiles!inner(email, name)
        `)
        .eq('announcement_id', announcementId);

      if (usersError) {
        throw new Error(`Failed to get interested users: ${usersError.message}`);
      }

      recipientEmails = interestedUsers?.map((u: any) => u.profiles.email).filter(Boolean) || [];
    } else if (targetAudience === 'all') {
      // Get all active users (with some recent activity)
      const { data: allUsers, error: allUsersError } = await supabase
        .from('profiles')
        .select('email, name')
        .not('email', 'is', null)
        .limit(1000); // Limit for safety

      if (allUsersError) {
        throw new Error(`Failed to get users: ${allUsersError.message}`);
      }

      recipientEmails = allUsers?.map(u => u.email).filter(Boolean) || [];
    }

    if (recipientEmails.length === 0) {
      console.log('No recipients found for announcement email');
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients found', recipientCount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prepare email content based on type
    let subject: string;
    let htmlContent: string;
    const brandName = announcement.brand_profiles?.company_name || 'A Brand';
    
    if (emailType === 'interest_notification') {
      subject = `New Task Opportunity from ${brandName} - ${announcement.title}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 24px;">🎯 New Task Announcement!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">${announcement.title}</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                ${announcement.description}
              </p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">📋 Task Details</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                  ${announcement.task_category ? `<li><strong>Category:</strong> ${announcement.task_category.replace('_', ' ')}</li>` : ''}
                  ${announcement.estimated_budget ? `<li><strong>Estimated Reward:</strong> $${announcement.estimated_budget}</li>` : ''}
                  ${announcement.estimated_launch_date ? `<li><strong>Launch Date:</strong> ${new Date(announcement.estimated_launch_date).toLocaleDateString()}</li>` : ''}
                </ul>
              </div>
              
              <p style="color: #666;">
                <strong>🏢 Posted by:</strong> ${brandName}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://stehjqdbncykevpokcvj.supabase.co" 
                 style="background: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Task Details on YIELD
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                💡 <strong>Pro Tip:</strong> Show interest early to get priority access when this task launches!
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">This email was sent because you showed interest in upcoming tasks on YIELD.</p>
            <p style="margin: 5px 0 0 0;">
              <a href="#" style="color: #FFD700;">Unsubscribe</a> | 
              <a href="https://stehjqdbncykevpokcvj.supabase.co" style="color: #FFD700;">Visit YIELD</a>
            </p>
          </div>
        </div>
      `;
    } else {
      subject = `🚀 Task Now Live: ${announcement.title}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #32CD32, #228B22); padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🚀 Task is Now Live!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">${announcement.title}</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                The task you showed interest in is now available! 
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  ⚡ <strong>Priority Access:</strong> You get first access because you showed early interest!
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://stehjqdbncykevpokcvj.supabase.co" 
                 style="background: #32CD32; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Complete Task Now
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #856404;">
                ⏰ <strong>Act Fast:</strong> Popular tasks fill up quickly. Secure your spot now!
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">Happy earning! - The YIELD Team</p>
          </div>
        </div>
      `;
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Yeildsocials <notifications@yeildsocials.com>",
          to: batch,
          subject: subject,
          html: htmlContent,
        });

        console.log(`Batch ${Math.floor(i / batchSize) + 1} sent successfully:`, emailResponse);
        successCount += batch.length;
      } catch (error) {
        console.error(`Failed to send batch ${Math.floor(i / batchSize) + 1}:`, error);
        failureCount += batch.length;
      }

      // Add small delay between batches
      if (i + batchSize < recipientEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log email delivery
    await supabase.from('email_delivery_logs').insert({
      email_type: `task_announcement_${emailType}`,
      status: failureCount === 0 ? 'delivered' : 'partial_failure',
      email: `batch_${recipientEmails.length}_recipients`,
      sent_at: new Date().toISOString(),
      delivered_at: failureCount === 0 ? new Date().toISOString() : null,
      delivery_time_seconds: Math.floor(Date.now() / 1000)
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: recipientEmails.length,
        successCount,
        failureCount,
        announcement: {
          id: announcement.id,
          title: announcement.title,
          brand: brandName
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-task-announcement-email function:", error);
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