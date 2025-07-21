
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { referralService } from '@/services/referralService';

export const useReferralMonitoring = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check for referral activation when user stats change
    const checkReferralActivation = async () => {
      await referralService.checkReferralActivation(user.id);
    };

    // Initial check
    checkReferralActivation();

    // Set up periodic checks (every 30 seconds)
    const interval = setInterval(checkReferralActivation, 30000);

    return () => clearInterval(interval);
  }, [user]);
};
