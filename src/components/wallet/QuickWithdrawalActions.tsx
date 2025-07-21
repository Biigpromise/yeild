
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CreditCard, Building2, ArrowRight } from 'lucide-react';

interface QuickWithdrawalActionsProps {
  userPoints: number;
  onStartWithdrawal: (method: string) => void;
}

export const QuickWithdrawalActions: React.FC<QuickWithdrawalActionsProps> = ({
  userPoints,
  onStartWithdrawal
}) => {
  const quickActions = [
    {
      id: 'flutterwave',
      title: 'Quick Bank Transfer',
      description: 'Withdraw to your Nigerian bank account',
      icon: <CreditCard className="h-5 w-5" />,
      minAmount: 1000,
      processingTime: '1-3 business days',
      fee: '5%',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'yield_wallet',
      title: 'Instant Yield Transfer',
      description: 'Transfer to your yield wallet instantly',
      icon: <Building2 className="h-5 w-5" />,
      minAmount: 100,
      processingTime: 'Instant',
      fee: 'Free',
      color: 'bg-green-50 border-green-200'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quickActions.map((action) => (
          <Card key={action.id} className={`border-l-4 ${action.color}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {action.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Min: {action.minAmount.toLocaleString()} pts
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.processingTime}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Fee: {action.fee}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartWithdrawal(action.id)}
                  disabled={userPoints < action.minAmount}
                  className="shrink-0"
                >
                  Start
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Your Balance</h4>
          <div className="text-2xl font-bold text-primary">
            {userPoints.toLocaleString()} Points
          </div>
          <p className="text-sm text-muted-foreground">
            ≈ ${(userPoints / 1000).toFixed(2)} USD
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
