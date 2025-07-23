import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BrandCampaignStats {
  activeCampaigns: number;
  totalReach: number;
  engagementRate: number;
  totalSpent: number;
  campaignGrowth: number;
  reachGrowth: number;
  engagementGrowth: number;
  spentGrowth: number;
}

export const useBrandCampaignStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BrandCampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch brand campaigns
        const { data: campaigns, count: totalCampaigns } = await supabase
          .from('brand_campaigns')
          .select('*', { count: 'exact' })
          .eq('brand_id', user.id);

        const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
        
        // Calculate total spent
        const totalSpent = campaigns?.reduce((sum, campaign) => 
          sum + Number(campaign.budget || 0), 0) || 0;

        // For now, use placeholder values for reach and engagement
        // In a real app, these would come from actual campaign performance data
        const totalReach = activeCampaigns * 4200; // Approximate reach per campaign
        const engagementRate = 75; // Placeholder percentage

        // Calculate growth (placeholder values)
        const campaignGrowth = 1;
        const reachGrowth = 15;
        const engagementGrowth = 8;
        const spentGrowth = 12;

        setStats({
          activeCampaigns,
          totalReach,
          engagementRate,
          totalSpent,
          campaignGrowth,
          reachGrowth,
          engagementGrowth,
          spentGrowth
        });

      } catch (error) {
        console.error('Error fetching brand campaign stats:', error);
        // Set default values on error
        setStats({
          activeCampaigns: 0,
          totalReach: 0,
          engagementRate: 0,
          totalSpent: 0,
          campaignGrowth: 0,
          reachGrowth: 0,
          engagementGrowth: 0,
          spentGrowth: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};