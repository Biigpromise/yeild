
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CommunityProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  profile_picture_url?: string;
  bio?: string;
  created_at: string;
}

export const useCommunityProfiles = () => {
  const [profiles, setProfiles] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, points, level, tasks_completed, profile_picture_url, bio, created_at')
        .order('points', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading community profiles:', error);
        toast.error('Failed to load community profiles');
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error in loadProfiles:', error);
      toast.error('Failed to load community profiles');
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    loading,
    refreshProfiles: loadProfiles
  };
};
