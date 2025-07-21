import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CreditCard, Bitcoin, Building2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentMethodsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const paymentMethods = [
    { 
      name: 'Bank Transfer', 
      icon: Building2, 
      description: 'Direct bank transfer (Nigeria)',
      status: 'Active'
    },
    { 
      name: 'Flutterwave', 
      icon: CreditCard, 
      description: 'International payments',
      status: 'Active'
    },
    { 
      name: 'Cryptocurrency', 
      icon: Bitcoin, 
      description: 'Bitcoin, USDT, etc.',
      status: 'Active'
    },
    { 
      name: 'Mobile Money', 
      icon: Smartphone, 
      description: 'Coming soon',
      status: 'Coming Soon'
    }
  ];

  const handleMethodClick = (method: any) => {
    if (method.status === 'Coming Soon') {
      toast.info(`${method.name} is coming soon!`);
    } else {
      toast.info(`${method.name} is available for withdrawals`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Payment Methods
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Available Payment Methods</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            These payment methods are available for withdrawing your points:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-colors ${
                  method.status === 'Active' ? 'hover:bg-muted/50' : 'opacity-70'
                }`}
                onClick={() => handleMethodClick(method)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <method.icon className="h-5 w-5" />
                    {method.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    {method.description}
                  </p>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                    method.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {method.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To withdraw funds, use the Withdraw button and select your preferred payment method.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};