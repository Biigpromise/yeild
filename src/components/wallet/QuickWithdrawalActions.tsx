
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { currencyService } from '@/services/currencyService';

interface QuickWithdrawalActionsProps {
  userPoints: number;
  onStartWithdrawal: (method: string) => void;
}

export const QuickWithdrawalActions: React.FC<QuickWithdrawalActionsProps> = ({
  userPoints,
  onStartWithdrawal
}) => {
  const quickAmounts = [1000, 5000, 10000];
  const maxQuickAmount = Math.min(userPoints, 10000);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts
            .filter(amount => amount <= maxQuickAmount)
            .map(amount => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="h-auto p-2 flex flex-col"
                onClick={() => onStartWithdrawal('quick')}
                disabled={userPoints < amount}
              >
                <div className="font-bold">{amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  ${currencyService.pointsToUSD(amount)}
                </div>
              </Button>
            ))}
        </div>

        {/* Withdrawal Methods */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Bank Transfer</span>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                1-3 days
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartWithdrawal('bank')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Yield Wallet</span>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Instant
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartWithdrawal('yield_wallet')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Full Withdrawal Button */}
        <Button
          className="w-full"
          onClick={() => onStartWithdrawal('full')}
          disabled={userPoints < 1000}
        >
          Start Custom Withdrawal
        </Button>

        {userPoints < 1000 && (
          <div className="text-sm text-muted-foreground text-center">
            Minimum 1,000 points required for withdrawal
          </div>
        )}
      </CardContent>
    </Card>
  );
};
