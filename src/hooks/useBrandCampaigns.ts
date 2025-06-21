
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Task } from '@/services/taskService';

// Helper function to safely transform social_media_links
const transformSocialMediaLinks = (links: any): Record<string, string> | null => {
  if (!links) return null;
  if (typeof links === 'string') {
    try {
      return JSON.parse(links);
    } catch {
      return null;
    }
  }
  if (typeof links === 'object') {
    return links as Record<string, string>;
  }
  return null;
};

// Helper function to transform database task to Task interface
const transformTask = (dbTask: any): Task => ({
  ...dbTask,
  social_media_links: transformSocialMediaLinks(dbTask.social_media_links)
});

export const useBrandCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('brand_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []).map(transformTask));
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
