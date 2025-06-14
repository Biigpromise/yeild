
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Bitcoin, 
  Gift, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethodStatusProps {
  onSetupMethod: (method: string) => void;
}

export const PaymentMethodStatus = ({ onSetupMethod }: PaymentMethodStatusProps) => {
  const { user } = useAuth();
  const [methodsStatus, setMethodsStatus] = useState({
    bank_transfer: false,
    crypto: false,
    gift_card: true, // Always available
    yield_wallet: true // Always available
  });

  useEffect(() => {
    checkPaymentMethods();
  }, [user]);

  const checkPaymentMethods = async () => {
    if (!user) return;

    try {
      // Check if user has saved crypto addresses
      const { data: cryptoData } = await supabase
        .from('crypto_addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setMethodsStatus(prev => ({
        ...prev,
        crypto: (cryptoData?.length || 0) > 0
      }));
    } catch (error) {
      console.error('Error checking payment methods:', error);
    }
  };

  const methods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: CreditCard,
      color: 'blue',
      setup: methodsStatus.bank_transfer
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Bitcoin,
      color: 'orange',
      setup: methodsStatus.crypto
    },
    {
      id: 'gift_card',
      name: 'Gift Cards',
      icon: Gift,
      color: 'green',
      setup: methodsStatus.gift_card
    },
    {
      id: 'yield_wallet',
      name: 'Yield Wallet',
      icon: Wallet,
      color: 'purple',
      setup: methodsStatus.yield_wallet
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 text-${method.color}-500`} />
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
                {method.setup ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetupMethod(method.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {Object.values(methodsStatus).filter(Boolean).length} of {methods.length} methods configured
        </div>
      </CardContent>
    </Card>
  );
};
