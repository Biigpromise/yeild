
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { referralService } from '@/services/referralService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReferralMonitoring = () => {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const subscriptionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  const loadReferralStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await referralService.getReferralStats(user.id);
      if (stats) {
        setReferralStats({
          totalReferrals: stats.totalReferrals,
          activeReferrals: stats.activeReferrals,
          pendingReferrals: stats.totalReferrals - stats.activeReferrals
        });
      }
      setConnectionError(null);
    } catch (error) {
      console.error('Error loading referral stats:', error);
      setConnectionError('Failed to load referral stats');
    }
  }, [user]);

  const checkReferralActivation = useCallback(async () => {
    if (!user) return;

    try {
      await referralService.checkReferralActivation(user.id);
      await loadReferralStats();
    } catch (error) {
      console.error('Error checking referral activation:', error);
      setConnectionError('Failed to check referral activation');
    }
  }, [user, loadReferralStats]);

  const setupSubscription = useCallback(() => {
    if (!user || isSubscribedRef.current) return;

    try {
      console.log('Setting up referral subscription for user:', user.id);
      
      const channel = supabase
        .channel(`referral-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_referrals',
            filter: `referrer_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Referral change detected:', payload);
            loadReferralStats();
            
            // Show toast notification for new referrals
            if (payload.eventType === 'INSERT') {
              toast.success('New referral received!', {
                description: 'Your referral will be activated when they complete their first task.'
              });
            } else if (payload.eventType === 'UPDATE' && payload.new?.is_active && !payload.old?.is_active) {
              toast.success('Referral activated!', {
                description: `You earned ${payload.new.points_awarded} points from an active referral.`
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Referral monitoring subscription active');
            setIsConnected(true);
            setConnectionError(null);
            isSubscribedRef.current = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Referral monitoring subscription error');
            setIsConnected(false);
            setConnectionError('Subscription error');
            isSubscribedRef.current = false;
            
            // Retry connection after 5 seconds
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Attempting to reconnect...');
              setupSubscription();
            }, 5000);
          } else if (status === 'CLOSED') {
            console.log('Subscription closed');
            setIsConnected(false);
            isSubscribedRef.current = false;
          }
        });

      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Error setting up referral subscription:', error);
      setConnectionError('Failed to setup subscription');
      setIsConnected(false);
      isSubscribedRef.current = false;
    }
  }, [user, loadReferralStats]);

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Cleaning up subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isSubscribedRef.current = false;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!user) {
      cleanup();
      return;
    }

    // Initial load
    checkReferralActivation();

    // Setup subscription
    setupSubscription();

    // Set up periodic checks (every 60 seconds)
    intervalRef.current = setInterval(checkReferralActivation, 60000);

    // Cleanup function
    return cleanup;
  }, [user?.id, checkReferralActivation, setupSubscription, cleanup]);

  return { referralStats, isConnected, connectionError };
};
