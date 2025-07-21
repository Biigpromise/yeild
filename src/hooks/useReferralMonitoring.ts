
import { useEffect, useState, useRef } from 'react';
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
  
  const subscriptionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Clear any existing subscription and interval
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const checkReferralActivation = async () => {
      try {
        await referralService.checkReferralActivation(user.id);
        await loadReferralStats();
      } catch (error) {
        console.error('Error checking referral activation:', error);
      }
    };

    const loadReferralStats = async () => {
      try {
        const stats = await referralService.getReferralStats(user.id);
        if (stats) {
          setReferralStats({
            totalReferrals: stats.totalReferrals,
            activeReferrals: stats.activeReferrals,
            pendingReferrals: stats.totalReferrals - stats.activeReferrals
          });
        }
      } catch (error) {
        console.error('Error loading referral stats:', error);
      }
    };

    // Initial checks
    checkReferralActivation();

    // Set up real-time subscription for referral changes
    const setupSubscription = () => {
      try {
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
            if (status === 'SUBSCRIBED') {
              console.log('Referral monitoring subscription active');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Referral monitoring subscription error');
            }
          });

        subscriptionRef.current = channel;
      } catch (error) {
        console.error('Error setting up referral subscription:', error);
      }
    };

    // Setup subscription
    setupSubscription();

    // Set up periodic checks (every 60 seconds)
    intervalRef.current = setInterval(checkReferralActivation, 60000);

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-subscriptions

  return { referralStats };
};
