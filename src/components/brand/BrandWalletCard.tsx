import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { brandWalletService, type BrandWallet } from '@/services/brandWalletService';
import { BrandWalletFundingDialog } from './BrandWalletFundingDialog';

interface BrandWalletCardProps {
  onBalanceUpdate?: (balance: number) => void;
}

export const BrandWalletCard: React.FC<BrandWalletCardProps> = ({ onBalanceUpdate }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<BrandWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFundingDialog, setShowFundingDialog] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [user]);

  const loadWallet = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const walletData = await brandWalletService.getWallet(user.id);
      setWallet(walletData);
      if (walletData && onBalanceUpdate) {
        onBalanceUpdate(walletData.balance);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundingComplete = () => {
    loadWallet();
    setShowFundingDialog(false);
  };

  if (loading) {
    return (
      <Card className="border border-border">
        <CardContent className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Brand Wallet</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                ₦{wallet?.balance.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    ₦{wallet?.total_deposited.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Deposited</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    ₦{wallet?.total_spent.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShowFundingDialog(true)}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Fund Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      <BrandWalletFundingDialog
        open={showFundingDialog}
        onOpenChange={setShowFundingDialog}
        onFundingComplete={handleFundingComplete}
      />
    </>
  );
};