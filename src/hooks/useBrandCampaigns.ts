
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BrandCampaign {
  id: string;
  title: string;
  description?: string;
  budget: number;
  funded_amount: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  requirements?: any;
  created_at: string;
  updated_at: string;
  payment_transaction_id?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export const useBrandCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setCampaigns([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching campaigns for user:', user.id);
      
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
      
      console.log('Fetched campaigns:', data);
      
      // Type cast the data to ensure status fields match our interface
      const typedData = (data || []).map(campaign => ({
        ...campaign,
        status: campaign.status as 'draft' | 'active' | 'paused' | 'completed' | 'cancelled',
        payment_status: campaign.payment_status as 'unpaid' | 'pending' | 'paid' | 'failed',
        admin_approval_status: campaign.admin_approval_status as 'pending' | 'approved' | 'rejected'
      }));
      
      setCampaigns(typedData);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns: ' + error.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  return { campaigns, loading, refreshCampaigns: fetchCampaigns };
};
