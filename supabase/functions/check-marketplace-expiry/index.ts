import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting marketplace expiry check...');

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    oneDayFromNow.setHours(23, 59, 59, 999);

    // Find listings expiring in 3 days
    const { data: listings3Days } = await supabase
      .from('marketplace_listings')
      .select('id, title, brand_id, end_date')
      .eq('status', 'active')
      .gte('end_date', now.toISOString())
      .lte('end_date', threeDaysFromNow.toISOString());

    // Find listings expiring in 1 day
    const { data: listings1Day } = await supabase
      .from('marketplace_listings')
      .select('id, title, brand_id, end_date')
      .eq('status', 'active')
      .gte('end_date', now.toISOString())
      .lte('end_date', oneDayFromNow.toISOString());

    // Find expired listings (just expired today)
    const { data: expiredListings } = await supabase
      .from('marketplace_listings')
      .select('id, title, brand_id, end_date')
      .eq('status', 'active')
      .lt('end_date', now.toISOString());

    console.log(`Found ${listings3Days?.length || 0} listings expiring in 3 days`);
    console.log(`Found ${listings1Day?.length || 0} listings expiring in 1 day`);
    console.log(`Found ${expiredListings?.length || 0} expired listings`);

    const notifications = [];

    // Process 3-day warnings
    if (listings3Days) {
      for (const listing of listings3Days) {
        // Check if notification already sent
        const { data: existing } = await supabase
          .from('marketplace_listing_notifications')
          .select('id')
          .eq('listing_id', listing.id)
          .eq('notification_type', 'expiry_warning_3d')
          .single();

        if (!existing) {
          // Create brand notification
          await supabase.from('brand_notifications').insert({
            brand_id: listing.brand_id,
            type: 'marketplace_expiry',
            title: 'Listing Expiring Soon',
            message: `Your listing "${listing.title}" will expire in 3 days. Extend now to keep it active!`
          });

          // Record that we sent this notification
          await supabase.from('marketplace_listing_notifications').insert({
            listing_id: listing.id,
            notification_type: 'expiry_warning_3d'
          });

          notifications.push({ listing: listing.title, type: '3-day warning' });
        }
      }
    }

    // Process 1-day warnings
    if (listings1Day) {
      for (const listing of listings1Day) {
        const { data: existing } = await supabase
          .from('marketplace_listing_notifications')
          .select('id')
          .eq('listing_id', listing.id)
          .eq('notification_type', 'expiry_warning_1d')
          .single();

        if (!existing) {
          await supabase.from('brand_notifications').insert({
            brand_id: listing.brand_id,
            type: 'marketplace_expiry',
            title: 'Listing Expires Tomorrow',
            message: `Last chance! Your listing "${listing.title}" expires tomorrow. Extend now to avoid losing visibility.`
          });

          await supabase.from('marketplace_listing_notifications').insert({
            listing_id: listing.id,
            notification_type: 'expiry_warning_1d'
          });

          notifications.push({ listing: listing.title, type: '1-day warning' });
        }
      }
    }

    // Process expired listings
    if (expiredListings) {
      for (const listing of expiredListings) {
        // Update listing status to expired
        await supabase
          .from('marketplace_listings')
          .update({ status: 'expired' })
          .eq('id', listing.id);

        const { data: existing } = await supabase
          .from('marketplace_listing_notifications')
          .select('id')
          .eq('listing_id', listing.id)
          .eq('notification_type', 'expired')
          .single();

        if (!existing) {
          await supabase.from('brand_notifications').insert({
            brand_id: listing.brand_id,
            type: 'marketplace_expired',
            title: 'Listing Expired',
            message: `Your listing "${listing.title}" has expired and is no longer visible to users. Create a new listing to continue advertising.`
          });

          await supabase.from('marketplace_listing_notifications').insert({
            listing_id: listing.id,
            notification_type: 'expired'
          });

          notifications.push({ listing: listing.title, type: 'expired' });
        }
      }
    }

    console.log('Marketplace expiry check completed', { notifications });

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notifications.length,
        notifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-marketplace-expiry:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
