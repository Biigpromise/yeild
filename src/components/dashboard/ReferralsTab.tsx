
import React from 'react';
import { EnhancedReferralSystem } from '@/components/referral/EnhancedReferralSystem';
import { BirdProgression } from '@/components/referral/BirdProgression';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { userService } from '@/services/userService';

export const ReferralsTab = () => {
  const { user } = useAuth();
  const { userProfile, userStats } = useDashboard();

  const currentBirdLevel = userService.getBirdLevel(
    userProfile?.active_referrals_count || 0,
    userStats.points || 0
  );
  
  const nextBirdLevel = userService.getNextBirdLevel(currentBirdLevel);

  return (
    <div className="space-y-6">
      {/* Bird Progression Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Bird Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <BirdProgression
            userPoints={userStats.points || 0}
            activeReferrals={userProfile?.active_referrals_count || 0}
            currentBirdLevel={currentBirdLevel}
            nextBirdLevel={nextBirdLevel}
          />
        </CardContent>
      </Card>

      {/* Enhanced Referral System */}
      <EnhancedReferralSystem />
    </div>
  );
};
