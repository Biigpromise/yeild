import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MarketplaceListingRow = Database['public']['Tables']['marketplace_listings']['Row'];

export interface MarketplaceListing extends MarketplaceListingRow {}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  image_url?: string;
  external_link?: string;
  days_paid: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export const marketplaceService = {
  // Get all active categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    const { data, error } = await supabase
      .from('marketplace_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Create a new listing
  async createListing(listingData: CreateListingData): Promise<MarketplaceListing> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const totalCost = listingData.days_paid * 10000;

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('brand_wallets')
      .select('balance')
      .eq('brand_id', user.id)
      .single();

    if (walletError) throw new Error('Failed to fetch wallet balance');
    if (!wallet || wallet.balance < totalCost) {
      throw new Error(`Insufficient balance. Required: ₦${totalCost.toLocaleString()}, Available: ₦${wallet?.balance.toLocaleString() || 0}`);
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + listingData.days_paid);

    // Create listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .insert({
        brand_id: user.id,
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        image_url: listingData.image_url,
        external_link: listingData.external_link,
        price_per_day: 10000,
        days_paid: listingData.days_paid,
        total_paid: totalCost,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (listingError) throw listingError;

    // Deduct from wallet using the process_wallet_transaction function
    const { error: walletTxError } = await supabase.rpc('process_wallet_transaction', {
      p_brand_id: user.id,
      p_transaction_type: 'withdrawal',
      p_amount: totalCost,
      p_description: `Marketplace listing: ${listingData.title}`,
      p_reference_id: listing.id
    });

    if (walletTxError) {
      // Rollback listing if wallet transaction fails
      await supabase.from('marketplace_listings').delete().eq('id', listing.id);
      throw new Error('Failed to process payment');
    }

    // Record platform revenue
    await supabase.from('platform_revenue').insert({
      source: 'marketplace',
      amount: totalCost,
      brand_id: user.id,
      listing_id: listing.id
    });

    return listing;
  },

  // Get brand's listings
  async getBrandListings(brandId: string): Promise<MarketplaceListing[]> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get active listings for users (with optional filters)
  async getActiveListings(filters?: {
    category?: string;
    search?: string;
  }): Promise<MarketplaceListing[]> {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString());

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Update listing
  async updateListing(id: string, updates: Partial<CreateListingData>): Promise<void> {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Remove listing (soft delete)
  async removeListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Extend listing
  async extendListing(id: string, additionalDays: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const additionalCost = additionalDays * 10000;

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('brand_wallets')
      .select('balance')
      .eq('brand_id', user.id)
      .single();

    if (walletError) throw new Error('Failed to fetch wallet balance');
    if (!wallet || wallet.balance < additionalCost) {
      throw new Error('Insufficient balance');
    }

    // Get current listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('end_date, days_paid, total_paid')
      .eq('id', id)
      .single();

    if (listingError) throw listingError;

    const newEndDate = new Date(listing.end_date);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);

    // Update listing
    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({
        days_paid: listing.days_paid + additionalDays,
        total_paid: listing.total_paid + additionalCost,
        end_date: newEndDate.toISOString(),
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Deduct from wallet
    const { error: walletTxError } = await supabase.rpc('process_wallet_transaction', {
      p_brand_id: user.id,
      p_transaction_type: 'withdrawal',
      p_amount: additionalCost,
      p_description: `Extended marketplace listing (${additionalDays} days)`,
      p_reference_id: id
    });

    if (walletTxError) throw new Error('Failed to process payment');

    // Record platform revenue
    await supabase.from('platform_revenue').insert({
      source: 'marketplace',
      amount: additionalCost,
      brand_id: user.id,
      listing_id: id
    });
  },

  // Track view
  async trackView(listingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('marketplace_interactions').insert({
      listing_id: listingId,
      user_id: user?.id,
      action_type: 'view'
    });

    // Get current count and increment
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('views_count')
      .eq('id', listingId)
      .single();

    if (listing) {
      await supabase
        .from('marketplace_listings')
        .update({ views_count: (listing.views_count || 0) + 1 })
        .eq('id', listingId);
    }
  },

  // Track click
  async trackClick(listingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('marketplace_interactions').insert({
      listing_id: listingId,
      user_id: user?.id,
      action_type: 'click'
    });

    // Get current count and increment
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('clicks_count')
      .eq('id', listingId)
      .single();

    if (listing) {
      await supabase
        .from('marketplace_listings')
        .update({ clicks_count: (listing.clicks_count || 0) + 1 })
        .eq('id', listingId);
    }
  },

  // Get listing analytics
  async getListingAnalytics(listingId: string) {
    const { data: interactions, error } = await supabase
      .from('marketplace_interactions')
      .select('action_type, created_at')
      .eq('listing_id', listingId);

    if (error) throw error;

    const views = interactions?.filter(i => i.action_type === 'view').length || 0;
    const clicks = interactions?.filter(i => i.action_type === 'click').length || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

    return {
      views,
      clicks,
      ctr: parseFloat(ctr),
      interactions: interactions || []
    };
  }
};
