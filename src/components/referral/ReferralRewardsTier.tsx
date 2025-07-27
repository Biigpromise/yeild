
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
        tier: 'Dove',
        pointsPerReferral: 10,
        icon: Star,
        color: 'bg-slate-100 text-slate-800 border-slate-300',
        nextTier: 'Sparrow',
        nextTierAt: 5,
        remaining: 5 - count
      };
    } else if (count < 20) {
      return {
        tier: 'Sparrow',
        pointsPerReferral: 15,
        icon: Award,
        color: 'bg-green-100 text-green-800 border-green-300',
        nextTier: 'Hawk',
        nextTierAt: 20,
        remaining: 20 - count
      };
    } else if (count < 50) {
      return {
        tier: 'Hawk',
        pointsPerReferral: 20,
        icon: Award,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        nextTier: 'Eagle',
        nextTierAt: 50,
        remaining: 50 - count
      };
    } else if (count < 100) {
      return {
        tier: 'Eagle',
        pointsPerReferral: 25,
        icon: Crown,
        color: 'bg-red-100 text-red-800 border-red-300',
        nextTier: 'Falcon',
        nextTierAt: 100,
        remaining: 100 - count
      };
    } else if (count < 500) {
      return {
        tier: 'Falcon',
        pointsPerReferral: 30,
        icon: Crown,
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        nextTier: 'Phoenix',
        nextTierAt: 500,
        remaining: 500 - count
      };
    } else {
      return {
        tier: 'Phoenix',
        pointsPerReferral: 35,
        icon: Crown,
        color: 'bg-pink-100 text-pink-800 border-pink-300',
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-800">🕊️ Dove</div>
            <div className="text-xs text-slate-600">10 pts/ref</div>
            <div className="text-xs text-slate-600">0-4 refs</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-xs font-medium text-green-800">🐦 Sparrow</div>
            <div className="text-xs text-green-600">15 pts/ref</div>
            <div className="text-xs text-green-600">5-19 refs</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-xs font-medium text-yellow-800">🦅 Hawk</div>
            <div className="text-xs text-yellow-600">20 pts/ref</div>
            <div className="text-xs text-yellow-600">20-49 refs</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-xs font-medium text-red-800">🦅🔥 Eagle</div>
            <div className="text-xs text-red-600">25 pts/ref</div>
            <div className="text-xs text-red-600">50-99 refs</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <div className="text-xs font-medium text-purple-800">🐦‍🔥 Falcon</div>
            <div className="text-xs text-purple-600">30 pts/ref</div>
            <div className="text-xs text-purple-600">100-499 refs</div>
          </div>
          <div className="p-2 bg-pink-50 rounded-lg">
            <div className="text-xs font-medium text-pink-800">🔥🕊️ Phoenix</div>
            <div className="text-xs text-pink-600">35 pts/ref</div>
            <div className="text-xs text-pink-600">500+ refs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
