import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignWorkflowRequest {
  campaign_id: string;
  action: 'approve' | 'reject' | 'submit_for_approval' | 'refund';
  reason?: string;
  admin_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { campaign_id, action, reason, admin_id }: CampaignWorkflowRequest = await req.json();

    if (!campaign_id || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('brand_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result = null;

    switch (action) {
      case 'submit_for_approval':
        // Check if campaign is fully funded
        if (!campaign.payment_status || campaign.payment_status !== 'paid') {
          return new Response(
            JSON.stringify({ error: "Campaign must be fully funded before submission for approval" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if brand has sufficient wallet balance
        const { data: wallet } = await supabaseClient
          .from('brand_wallets')
          .select('balance')
          .eq('brand_id', campaign.brand_id)
          .single();

        if (!wallet || wallet.balance < campaign.budget) {
          return new Response(
            JSON.stringify({ error: "Insufficient wallet balance. Please fund your wallet before submitting for approval." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Deduct campaign budget from wallet and update campaign status
        await supabaseClient.rpc('process_wallet_transaction', {
          p_brand_id: campaign.brand_id,
          p_transaction_type: 'campaign_charge',
          p_amount: campaign.budget,
          p_description: `Campaign charge for: ${campaign.title}`,
          p_campaign_id: campaign.id
        });

        result = await supabaseClient
          .from('brand_campaigns')
          .update({
            admin_approval_status: 'pending',
            status: 'pending_approval',
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign_id)
          .select()
          .single();

        // Create admin notification
        await supabaseClient
          .from('admin_notifications')
          .insert({
            type: 'campaign_approval_needed',
            message: `New campaign "${campaign.title}" submitted for approval`,
            link_to: `/admin?section=campaigns&campaign=${campaign_id}`
          });

        break;

      case 'approve':
        result = await supabaseClient
          .from('brand_campaigns')
          .update({
            admin_approval_status: 'approved',
            status: 'active',
            approved_by: admin_id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign_id)
          .select()
          .single();

        // Create notification for brand
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: campaign.brand_id,
            type: 'success',
            title: 'Campaign Approved',
            content: `Your campaign "${campaign.title}" has been approved and is now live!`
          });

        break;

      case 'reject':
        // Process refund
        await supabaseClient.rpc('process_wallet_transaction', {
          p_brand_id: campaign.brand_id,
          p_transaction_type: 'refund',
          p_amount: campaign.budget,
          p_description: `Refund for rejected campaign: ${campaign.title}`,
          p_campaign_id: campaign.id
        });

        result = await supabaseClient
          .from('brand_campaigns')
          .update({
            admin_approval_status: 'rejected',
            status: 'rejected',
            rejection_reason: reason,
            approved_by: admin_id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign_id)
          .select()
          .single();

        // Create notification for brand
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: campaign.brand_id,
            type: 'error',
            title: 'Campaign Rejected',
            content: `Your campaign "${campaign.title}" was rejected. Reason: ${reason || 'No reason provided'}. A full refund has been processed to your wallet.`
          });

        break;

      case 'refund':
        // Manual refund process
        await supabaseClient.rpc('process_wallet_transaction', {
          p_brand_id: campaign.brand_id,
          p_transaction_type: 'refund',
          p_amount: campaign.budget,
          p_description: `Manual refund for campaign: ${campaign.title}`,
          p_campaign_id: campaign.id
        });

        result = await supabaseClient
          .from('brand_campaigns')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign_id)
          .select()
          .single();

        // Create notification for brand
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: campaign.brand_id,
            type: 'info',
            title: 'Campaign Refunded',
            content: `A refund of $${campaign.budget} has been processed for campaign "${campaign.title}".`
          });

        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (result?.error) {
      throw result.error;
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: `Campaign ${action} completed successfully`,
        data: result?.data
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Campaign workflow error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});