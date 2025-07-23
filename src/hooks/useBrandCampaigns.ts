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
      
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching brand campaigns:", error);
        toast.error("Failed to load brand campaigns: " + error.message);
        setCampaigns([]);
      } else {
        console.log('Brand campaigns fetched:', data);
        setCampaigns(data as any); // Use any to bypass strict type checking for now
      }
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
          fetchBrandCampaigns(); // Refetch to get complete data with joins
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'brand_campaigns' },
        (payload) => {
          console.log('Brand campaign updated:', payload);
          fetchBrandCampaigns(); // Refetch to get complete data with joins
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