
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, Gift } from 'lucide-react';

interface ReferralStatusCardProps {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

export const ReferralStatusCard: React.FC<ReferralStatusCardProps> = ({
  totalReferrals,
  activeReferrals,
  pendingReferrals,
  totalPointsEarned
}) => {
  const activationRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Referral Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">{totalReferrals}</span>
            </div>
            <p className="text-sm text-blue-600">Total Referrals</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-800">{activeReferrals}</span>
            </div>
            <p className="text-sm text-green-600">Active Referrals</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-orange-800">{pendingReferrals}</span>
            </div>
            <p className="text-sm text-orange-600">Pending</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-800">{totalPointsEarned}</span>
            </div>
            <p className="text-sm text-purple-600">Points Earned</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700">Activation Rate</span>
            <span className="font-medium text-blue-800">{activationRate.toFixed(1)}%</span>
          </div>
          <Progress value={activationRate} className="h-2" />
        </div>

        {pendingReferrals > 0 && (
          <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>{pendingReferrals}</strong> referral{pendingReferrals !== 1 ? 's' : ''} pending activation. 
              They'll be activated when your referred users complete their first task or earn 50+ points.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
