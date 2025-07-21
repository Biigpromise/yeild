
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Crown } from 'lucide-react';

interface ReferralRewardsTierProps {
  activeReferrals: number;
}

export const ReferralRewardsTier: React.FC<ReferralRewardsTierProps> = ({
  activeReferrals
}) => {
  const getTierInfo = (count: number) => {
    if (count < 5) {
      return {
        tier: 'Bronze',
        pointsPerReferral: 10,
        icon: Star,
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        nextTier: 'Silver',
        nextTierAt: 5,
        remaining: 5 - count
      };
    } else if (count < 15) {
      return {
        tier: 'Silver',
        pointsPerReferral: 20,
        icon: Award,
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        nextTier: 'Gold',
        nextTierAt: 15,
        remaining: 15 - count
      };
    } else {
      return {
        tier: 'Gold',
        pointsPerReferral: 30,
        icon: Crown,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        nextTier: null,
        nextTierAt: null,
        remaining: 0
      };
    }
  };

  const tierInfo = getTierInfo(activeReferrals);
  const IconComponent = tierInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Referral Tier System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={tierInfo.color}>
            {tierInfo.tier} Tier
          </Badge>
          <span className="text-sm text-muted-foreground">
            {tierInfo.pointsPerReferral} points per active referral
          </span>
        </div>

        {tierInfo.nextTier && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">
                Next: {tierInfo.nextTier} Tier
              </span>
              <span className="text-sm text-blue-600">
                {tierInfo.remaining} more referral{tierInfo.remaining !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeReferrals / tierInfo.nextTierAt!) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-amber-50 rounded-lg">
            <div className="text-sm font-medium text-amber-800">Bronze</div>
            <div className="text-xs text-amber-600">10 pts/referral</div>
            <div className="text-xs text-amber-600">0-4 referrals</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-800">Silver</div>
            <div className="text-xs text-gray-600">20 pts/referral</div>
            <div className="text-xs text-gray-600">5-14 referrals</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">Gold</div>
            <div className="text-xs text-yellow-600">30 pts/referral</div>
            <div className="text-xs text-yellow-600">15+ referrals</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
