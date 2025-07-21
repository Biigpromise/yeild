
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Settings, CreditCard, Smartphone, Building2 } from 'lucide-react';

interface PaymentMethodStatusProps {
  onSetupMethod: (method: string) => void;
}

export const PaymentMethodStatus: React.FC<PaymentMethodStatusProps> = ({ onSetupMethod }) => {
  const paymentMethods = [
    {
      id: 'flutterwave',
      name: 'Bank Transfer',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'active',
      description: 'Withdraw to Nigerian banks',
      features: ['All major banks', 'Microfinance banks', 'Instant verification']
    },
    {
      id: 'yield_wallet',
      name: 'Yield Wallet',
      icon: <Building2 className="h-5 w-5" />,
      status: 'active',
      description: 'Transfer to yield wallet',
      features: ['No fees', 'Instant transfer', 'Earn yield']
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: <Smartphone className="h-5 w-5" />,
      status: 'coming_soon',
      description: 'Withdraw to crypto wallet',
      features: ['Bitcoin', 'Ethereum', 'USDT']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'coming_soon':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            <Settings className="h-3 w-3 mr-1" />
            Setup Required
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{method.name}</span>
                      {getStatusBadge(method.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {method.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {method.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetupMethod(method.id)}
                  disabled={method.status === 'coming_soon'}
                >
                  {method.status === 'active' ? 'Use' : 'Setup'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
