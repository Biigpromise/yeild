
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Bitcoin, 
  Gift, 
  Wallet,
  ArrowRight
} from "lucide-react";

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
      description: 'To Naira account'
    },
    {
      id: 'crypto',
      name: 'Crypto',
      icon: Bitcoin,
      minAmount: 1000,
      fee: '3%',
      color: 'orange',
      description: 'BTC, ETH, USDT'
    },
    {
      id: 'gift_card',
      name: 'Gift Cards',
      icon: Gift,
      minAmount: 1000,
      fee: '0%',
      color: 'green',
      description: 'Amazon, Apple, etc.'
    },
    {
      id: 'yield_wallet',
      name: 'Yield Wallet',
      icon: Wallet,
      minAmount: 100,
      fee: '0%',
      color: 'purple',
      description: 'Internal wallet'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Withdrawals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {withdrawalMethods.map((method) => {
          const Icon = method.icon;
          const canWithdraw = userPoints >= method.minAmount;
          
          return (
            <div
              key={method.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                canWithdraw ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-50'
              }`}
              onClick={() => canWithdraw && onStartWithdrawal(method.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 text-${method.color}-500`} />
                <div>
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-muted-foreground">{method.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Min: {method.minAmount.toLocaleString()}
                </div>
                <Badge variant="outline" className="text-xs">
                  Fee: {method.fee}
                </Badge>
              </div>
            </div>
          );
        })}
        
        {userPoints < 100 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Need at least 100 points to withdraw</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
