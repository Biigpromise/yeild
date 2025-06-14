
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Bitcoin, 
  Gift, 
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { currencyService } from "@/services/currencyService";

interface QuickWithdrawalActionsProps {
  userPoints: number;
  onStartWithdrawal: (method: string) => void;
}

export const QuickWithdrawalActions = ({ userPoints, onStartWithdrawal }: QuickWithdrawalActionsProps) => {
  const withdrawalMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: CreditCard,
      minAmount: 1000,
      fee: '5%',
      color: 'blue',
      description: 'To Naira account',
      processingTime: '1-3 days'
    },
    {
      id: 'crypto',
      name: 'Crypto',
      icon: Bitcoin,
      minAmount: 1000,
      fee: '3%',
      color: 'orange',
      description: 'BTC, ETH, USDT',
      processingTime: '1-24 hours'
    },
    {
      id: 'gift_card',
      name: 'Gift Cards',
      icon: Gift,
      minAmount: 1000,
      fee: '0%',
      color: 'green',
      description: 'Amazon, Apple, etc.',
      processingTime: 'Instant'
    },
    {
      id: 'yield_wallet',
      name: 'Yield Wallet',
      icon: Wallet,
      minAmount: 100,
      fee: '0%',
      color: 'purple',
      description: 'Internal wallet',
      processingTime: 'Instant'
    }
  ];

  const usdValue = currencyService.pointsToUSD(userPoints);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Quick Withdrawals
          <Badge variant="outline" className="text-xs">
            ${usdValue.toFixed(2)} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {withdrawalMethods.map((method) => {
          const Icon = method.icon;
          const canWithdraw = userPoints >= method.minAmount;
          const minUsdAmount = currencyService.pointsToUSD(method.minAmount);
          
          return (
            <div
              key={method.id}
              className={`relative p-4 border rounded-lg transition-all ${
                canWithdraw 
                  ? 'hover:bg-muted/50 cursor-pointer border-green-200 bg-green-50/30' 
                  : 'opacity-60 border-orange-200 bg-orange-50/30'
              }`}
              onClick={() => canWithdraw && onStartWithdrawal(method.id)}
            >
              {/* Readiness Indicator */}
              <div className="absolute top-3 right-3">
                {canWithdraw ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>

              <div className="flex items-center gap-3 pr-6">
                <Icon className={`h-6 w-6 text-${method.color}-500`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{method.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Fee: {method.fee}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {method.description}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Min: {method.minAmount.toLocaleString()} pts (${minUsdAmount.toFixed(2)})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {method.processingTime}
                    </div>
                  </div>
                </div>
              </div>

              {canWithdraw && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartWithdrawal(method.id);
                  }}
                >
                  Withdraw ${minUsdAmount.toFixed(2)}+
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}

              {!canWithdraw && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-orange-600 font-medium">
                    Need {(method.minAmount - userPoints).toLocaleString()} more points
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(currencyService.pointsToUSD(method.minAmount - userPoints)).toFixed(2)} more needed
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {userPoints < 100 && (
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-sm font-medium text-orange-800">Complete more tasks to unlock withdrawals</p>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: 100 points (${currencyService.pointsToUSD(100).toFixed(2)})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
