
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!user) return;

    // Initial check for referral activation
    const checkReferralActivation = async () => {
      try {
        await referralService.checkReferralActivation(user.id);
        // Refresh stats after potential activation
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
    loadReferralStats();

    // Set up real-time subscription for referral changes
    const referralSubscription = supabase
      .channel('referral-changes')
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
          } else if (payload.eventType === 'UPDATE' && payload.new.is_active && !payload.old.is_active) {
            toast.success('Referral activated!', {
              description: `You earned ${payload.new.points_awarded} points from an active referral.`
            });
          }
        }
      )
      .subscribe();

    // Set up periodic checks (every 60 seconds)
    const interval = setInterval(checkReferralActivation, 60000);

    return () => {
      clearInterval(interval);
      referralSubscription.unsubscribe();
    };
  }, [user]);

  return { referralStats };
};
