
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface WithdrawalLimitsProps {
  userPoints: number;
  userLevel: number;
  isVerified: boolean;
}

export const WithdrawalLimits: React.FC<WithdrawalLimitsProps> = ({
  userPoints,
  userLevel,
  isVerified
}) => {
  const getWithdrawalLimits = () => {
    if (!isVerified) {
      return {
        daily: 5000,
        weekly: 15000,
        monthly: 50000
      };
    }

    // Verified users get higher limits based on level
    const baseLimit = 10000;
    const levelMultiplier = 1 + (userLevel - 1) * 0.5;
    
    return {
      daily: Math.floor(baseLimit * levelMultiplier),
      weekly: Math.floor(baseLimit * levelMultiplier * 5),
      monthly: Math.floor(baseLimit * levelMultiplier * 20)
    };
  };

  const limits = getWithdrawalLimits();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Withdrawal Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={isVerified ? "default" : "secondary"}>
            {isVerified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Account
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unverified Account
              </>
            )}
          </Badge>
          <Badge variant="outline">Level {userLevel}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Daily Limit:</span>
            <span className="font-medium">{limits.daily.toLocaleString()} points</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Weekly Limit:</span>
            <span className="font-medium">{limits.weekly.toLocaleString()} points</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly Limit:</span>
            <span className="font-medium">{limits.monthly.toLocaleString()} points</span>
          </div>
        </div>

        {!isVerified && (
          <div className="p-3 bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-800">
              <div className="font-medium">Increase Your Limits</div>
              <div>Complete account verification to unlock higher withdrawal limits</div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div>Limits reset at midnight UTC</div>
          <div>Higher levels unlock increased limits</div>
        </div>
      </CardContent>
    </Card>
  );
};
