
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface YieldWalletPaymentProps {
  onDetailsChange: (details: any) => void;
  details: any;
}

export const YieldWalletPayment = ({ onDetailsChange, details }: YieldWalletPaymentProps) => {
  const { user } = useAuth();
  const [yieldWallet, setYieldWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYieldWallet();
  }, [user]);

  const loadYieldWallet = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('yield_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading yield wallet:', error);
      } else if (data) {
        setYieldWallet(data);
      }
    } catch (error) {
      console.error('Error loading yield wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (amount: string) => {
    onDetailsChange({
      ...details,
      amount: parseInt(amount) || 0,
      transferType: 'deposit' // transferring from main points to yield wallet
    });
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="h-8 w-8 text-purple-500" />
            <div>
              <h4 className="font-semibold">Your Yield Wallet</h4>
              <p className="text-sm text-muted-foreground">
                Current Balance: {yieldWallet?.balance?.toLocaleString() || 0} points
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Earned:</span>
              <p className="font-medium">{yieldWallet?.total_earned?.toLocaleString() || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Spent:</span>
              <p className="font-medium">{yieldWallet?.total_spent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="transfer-amount">Transfer Amount (Points)</Label>
        <Input
          id="transfer-amount"
          type="number"
          placeholder="Enter amount to transfer"
          value={details.amount || ''}
          onChange={(e) => handleAmountChange(e.target.value)}
          min="100"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum transfer: 100 points
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="font-medium">Main Balance</div>
          <div className="text-lg font-bold text-blue-600">
            {details.userPoints?.toLocaleString() || 0}
          </div>
        </div>
        <ArrowRight className="h-6 w-6 text-purple-500" />
        <div className="text-center">
          <div className="font-medium">Yield Wallet</div>
          <div className="text-lg font-bold text-purple-600">
            {((yieldWallet?.balance || 0) + (details.amount || 0)).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800">
          <strong>Yield Wallet Benefits:</strong> Use your yield wallet to unlock premium features, 
          purchase upgrades, and access exclusive content. Transfers are instant and free!
        </p>
      </div>
    </div>
  );
};
