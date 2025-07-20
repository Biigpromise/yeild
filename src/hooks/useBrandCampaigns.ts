
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
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  requirements?: any;
  created_at: string;
  updated_at: string;
}

export const useBrandCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch campaigns: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  return { campaigns, loading, refreshCampaigns: fetchCampaigns };
};
