
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Gift, 
  Target,
  Star,
  Zap
} from 'lucide-react';

interface ReferralStatsDashboardProps {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  currentTier: 'bronze' | 'silver' | 'gold';
  nextTierProgress: number;
}

export const ReferralStatsDashboard: React.FC<ReferralStatsDashboardProps> = ({
  totalReferrals,
  activeReferrals,
  pendingReferrals,
  totalPointsEarned,
  currentTier,
  nextTierProgress
}) => {
  const activationRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;
  
  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'silver':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Star,
          nextTier: 'Gold',
          pointsPerReferral: 20
        };
      case 'gold':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: Zap,
          nextTier: null,
          pointsPerReferral: 30
        };
      default:
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Target,
          nextTier: 'Silver',
          pointsPerReferral: 10
        };
    }
  };

  const tierInfo = getTierInfo(currentTier);
  const TierIcon = tierInfo.icon;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-800">{totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-800">{activeReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-800">{pendingReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold text-purple-800">{totalPointsEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TierIcon className="h-5 w-5" />
            Current Tier Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={tierInfo.color}>
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Tier
            </Badge>
            <span className="text-sm text-muted-foreground">
              {tierInfo.pointsPerReferral} points per active referral
            </span>
          </div>

          {tierInfo.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Progress to {tierInfo.nextTier}</span>
                <span className="font-medium">{nextTierProgress}%</span>
              </div>
              <Progress value={nextTierProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Activation Rate</span>
              <span className="font-medium">{activationRate.toFixed(1)}%</span>
            </div>
            <Progress value={activationRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-800">
                {activeReferrals > 0 ? Math.round(totalPointsEarned / activeReferrals) : 0}
              </div>
              <div className="text-xs text-green-600">Avg Points/Referral</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">
                {totalReferrals > 0 ? Math.round((activeReferrals / totalReferrals) * 100) : 0}%
              </div>
              <div className="text-xs text-blue-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
