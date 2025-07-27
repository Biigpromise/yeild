import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'maintenanceMode')
          .single();

        if (error) {
          console.warn('Failed to check maintenance mode:', error);
          setIsMaintenanceMode(false);
        } else {
          setIsMaintenanceMode(data?.value === true);
        }
      } catch (error) {
        console.warn('Error checking maintenance mode:', error);
        setIsMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceMode();

    // Set up real-time subscription for maintenance mode changes
    const subscription = supabase
      .channel('maintenance-mode')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_settings',
          filter: 'key=eq.maintenanceMode'
        },
        (payload) => {
          console.log('Maintenance mode changed:', payload);
          if (payload.new && 'value' in payload.new) {
            setIsMaintenanceMode(payload.new.value === true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isMaintenanceMode, loading };
};