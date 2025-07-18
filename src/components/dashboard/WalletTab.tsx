
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const WalletTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-yeild-yellow mb-2">0 Points</div>
            <p className="text-muted-foreground mb-4">Complete tasks to earn points</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recent Transactions</h4>
            <div className="text-center text-muted-foreground py-8">
              <ArrowDownLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
