
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        console.log('Checking maintenance mode status...');
        
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'maintenanceMode')
          .single();

        if (error) {
          console.warn('Failed to check maintenance mode:', error);
          // If the setting doesn't exist, create it with default value
          if (error.code === 'PGRST116') {
            console.log('Creating default maintenance mode setting...');
            const { error: insertError } = await supabase
              .from('platform_settings')
              .insert({
                key: 'maintenanceMode',
                value: false,
                description: 'Enable/disable maintenance mode for the platform'
              });
            
            if (insertError) {
              console.error('Failed to create maintenance mode setting:', insertError);
            }
          }
          setIsMaintenanceMode(false);
        } else {
          console.log('Maintenance mode data:', data);
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

  const toggleMaintenanceMode = async () => {
    try {
      console.log('Toggling maintenance mode...');
      
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'maintenanceMode',
          value: !isMaintenanceMode,
          description: 'Enable/disable maintenance mode for the platform'
        });

      if (error) {
        console.error('Failed to toggle maintenance mode:', error);
        throw error;
      }

      setIsMaintenanceMode(!isMaintenanceMode);
      console.log('Maintenance mode toggled successfully');
      return true;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      return false;
    }
  };

  return { isMaintenanceMode, loading, toggleMaintenanceMode };
};
