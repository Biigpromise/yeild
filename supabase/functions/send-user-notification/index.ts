import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  userIds?: string[];
}

serve(async (req) => {
  console.log('Listening on http://localhost:9999/');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    console.log('Sending notification:', request);

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let targetUsers: string[] = [];

    if (request.targetAudience === "all") {
      // Get all user IDs
      const { data: users, error: usersError } = await supabaseAdmin
        .from('profiles')
        .select('id');

      if (usersError) throw usersError;
      targetUsers = users?.map(user => user.id) || [];
    } else if (request.targetAudience === "specific" && request.userIds) {
      targetUsers = request.userIds;
    }

    console.log(`Sending notification to ${targetUsers.length} users`);

    // Insert notifications for each target user
    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      title: request.title,
      content: request.content,
      type: request.type,
      created_at: new Date().toISOString()
    }));

    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
    }

    console.log(`Successfully sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent to ${notifications.length} users`,
        count: notifications.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-user-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});