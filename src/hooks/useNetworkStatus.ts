
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        setSupabaseConnected(!error);
      } catch (error) {
        console.error('Supabase connection check failed:', error);
        setSupabaseConnected(false);
      }
    };

    // Check connection every 30 seconds
    const interval = setInterval(checkSupabaseConnection, 30000);
    
    // Initial check
    checkSupabaseConnection();

    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    supabaseConnected,
    isFullyConnected: isOnline && supabaseConnected
  };
};
