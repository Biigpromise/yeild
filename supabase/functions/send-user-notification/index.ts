
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { title, content, type, targetAudience, userIds }: NotificationRequest = await req.json();

    console.log("Sending notification:", { title, content, type, targetAudience });

    let notifications = [];

    if (targetAudience === "all") {
      // Get all user IDs
      const { data: users, error: usersError } = await supabaseClient
        .from("profiles")
        .select("id");

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      notifications = users.map(user => ({
        user_id: user.id,
        title,
        content,
        type,
        is_read: false
      }));
    } else if (userIds && userIds.length > 0) {
      notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        content,
        type,
        is_read: false
      }));
    } else {
      throw new Error("Invalid target audience or user IDs");
    }

    // Insert notifications
    const { data, error } = await supabaseClient
      .from("notifications")
      .insert(notifications);

    if (error) {
      throw new Error(`Failed to insert notifications: ${error.message}`);
    }

    console.log(`Successfully sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${notifications.length} notifications` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending notifications:", error);
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
