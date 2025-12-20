import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Building, Check, Sparkles } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fee: string;
  processingTime: string;
  available: boolean;
  recommended?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'paystack',
    name: 'Bank Transfer (Paystack)',
    description: 'Direct transfer to any Nigerian bank account including OPay, Moniepoint, Kuda & more',
    icon: Building,
    fee: '2% fee',
    processingTime: '2-10 mins',
    available: true,
    recommended: true
  },
  {
    id: 'yield_wallet',
    name: 'Yield Wallet',
    description: 'Transfer to your yield wallet and earn daily interest on your balance',
    icon: Wallet,
    fee: 'No fees',
    processingTime: 'Instant',
    available: true
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{method.name}</h4>
                        {(method as any).recommended && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
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

      {/* Supported Banks Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h5 className="font-medium text-sm">All Nigerian Banks Supported</h5>
              <p className="text-xs text-muted-foreground">
                Withdraw to OPay, Moniepoint, PalmPay, Kuda, GTBank, Zenith, Access Bank, UBA, First Bank and 30+ more banks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};