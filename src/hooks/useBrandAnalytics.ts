
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BrandAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  totalPointsAwarded: number;
  submissionsOverTime: { date: string; count: number }[];
}

export const useBrandAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('tasks')
        .select('id, points, status')
        .eq('brand_user_id', user.id);

      if (campaignsError) throw campaignsError;
      if (!campaigns || campaigns.length === 0) {
        setAnalytics({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalSubmissions: 0,
          approvedSubmissions: 0,
          pendingSubmissions: 0,
          totalPointsAwarded: 0,
          submissionsOverTime: [],
        });
        setLoading(false);
        return;
      }

      const taskIds = campaigns.map(c => c.id);

      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('task_id, status, submitted_at')
        .in('task_id', taskIds);
      
      if (submissionsError) throw submissionsError;

      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalSubmissions = submissions?.length || 0;
      const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
      const pendingSubmissions = submissions?.filter(s => s.status === 'pending').length || 0;
      
      let totalPointsAwarded = 0;
      if (submissions) {
        submissions.forEach(sub => {
          if (sub.status === 'approved') {
            const campaign = campaigns.find(c => c.id === sub.task_id);
            if (campaign) {
              totalPointsAwarded += campaign.points;
            }
          }
        });
      }

      const submissionsOverTime: { date: string; count: number }[] = [];
      const dateMap = new Map<string, number>();
      if (submissions) {
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateMap.set(dateStr, 0);
          }

          submissions.forEach(sub => {
            if (sub.submitted_at) {
              const dateStr = sub.submitted_at.split('T')[0];
              if (dateMap.has(dateStr)) {
                dateMap.set(dateStr, dateMap.get(dateStr)! + 1);
              }
            }
          });
          
          dateMap.forEach((count, date) => {
             submissionsOverTime.push({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count });
          });
      }

      setAnalytics({
        totalCampaigns,
        activeCampaigns,
        totalSubmissions,
        approvedSubmissions,
        pendingSubmissions,
        totalPointsAwarded,
        submissionsOverTime,
      });

    } catch (error: any) {
      toast.error('Failed to fetch analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);
  
  return { analytics, loading, refreshAnalytics: fetchAnalytics };
};
