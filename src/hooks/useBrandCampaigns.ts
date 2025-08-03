
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BrandCampaign = {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  budget: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  admin_approval_status?: string;
  approved_at?: string;
  approved_by?: string;
  funded_amount?: number;
  payment_status?: string;
  payment_transaction_id?: string;
  rejection_reason?: string;
  requirements?: any;
  target_audience?: any;
  updated_at?: string;
  wallet_transaction_id?: string;
  logo_url?: string;
  converted_to_tasks?: boolean;
  tasks_generated_at?: string;
  tasks_generated_by?: string;
  auto_convert_enabled?: boolean;
  brand_profiles?: {
    company_name: string;
  } | null;
};

export const useBrandCampaigns = () => {
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrandCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Fetching brand campaigns...');
      
      // First get the campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('brand_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error("Error fetching brand campaigns:", campaignsError);
        toast.error("Failed to load brand campaigns: " + campaignsError.message);
        setCampaigns([]);
        return;
      }

      // Then get the brand profiles separately
      const brandIds = campaignsData.map(campaign => campaign.brand_id).filter(Boolean);
      
      let brandProfiles: any[] = [];
      if (brandIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('brand_profiles')
          .select('user_id, company_name')
          .in('user_id', brandIds);

        if (profilesError) {
          console.error("Error fetching brand profiles:", profilesError);
          // Don't fail the entire query if brand profiles fail
        } else {
          brandProfiles = profilesData || [];
        }
      }

      // Combine the data
      const combinedData = campaignsData.map(campaign => ({
        ...campaign,
        brand_profiles: brandProfiles.find(profile => profile.user_id === campaign.brand_id) || null
      }));

      console.log('Brand campaigns fetched:', combinedData);
      setCampaigns(combinedData);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandCampaigns();

    const channel = supabase
      .channel('admin-brand-campaigns')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'brand_campaigns' },
        (payload) => {
          console.log('New brand campaign received:', payload);
          toast.info("New brand campaign created!");
          fetchBrandCampaigns(); // Refetch to get complete data
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'brand_campaigns' },
        (payload) => {
          console.log('Brand campaign updated:', payload);
          fetchBrandCampaigns(); // Refetch to get complete data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    campaigns,
    loading,
    fetchBrandCampaigns
  };
};
