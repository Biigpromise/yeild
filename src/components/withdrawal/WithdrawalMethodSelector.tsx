import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Bitcoin, Gift, Building, Check } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fee: string;
  processingTime: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'flutterwave',
    name: 'Bank Transfer',
    description: 'Transfer directly to your Nigerian bank account',
    icon: Building,
    fee: '5% processing fee',
    processingTime: '1-24 hours',
    available: true
  },
  {
    id: 'yield_wallet',
    name: 'Yield Wallet',
    description: 'Transfer to your yield wallet for compound earnings',
    icon: Wallet,
    fee: 'No fees',
    processingTime: 'Instant',
    available: true
  },
  {
    id: 'crypto',
    name: 'Crypto Wallet',
    description: 'Withdraw to your cryptocurrency wallet',
    icon: Bitcoin,
    fee: 'Network fees apply',
    processingTime: '5-30 minutes',
    available: false
  },
  {
    id: 'gift_card',
    name: 'Gift Cards',
    description: 'Redeem points for popular gift cards',
    icon: Gift,
    fee: 'No additional fees',
    processingTime: 'Instant delivery',
    available: false
  }
];

interface WithdrawalMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onDetailsChange: (details: any) => void;
}

export const WithdrawalMethodSelector: React.FC<WithdrawalMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  onDetailsChange
}) => {
  const handleMethodSelect = (methodId: string) => {
    onMethodChange(methodId);
    onDetailsChange({});
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-xl font-semibold">Choose Your Withdrawal Method</h3>
        <p className="text-muted-foreground">Select how you'd like to receive your earnings</p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <Card
              key={method.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : method.available
                    ? 'hover:border-primary/50 hover:shadow-md'
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => method.available && handleMethodSelect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{method.name}</h4>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                      {!method.available && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm">{method.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Fee: {method.fee}</span>
                        <span>•</span>
                        <span>Time: {method.processingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="bg-muted/20 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h5 className="font-medium text-sm">Recommended: Bank Transfer</h5>
              <p className="text-xs text-muted-foreground">
                Most reliable method with direct deposit to your Nigerian bank account. 
                Fees are competitive and processing is typically within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};