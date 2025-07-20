
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Building2, Smartphone, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentMethodsService, UserPaymentMethod } from '@/services/paymentMethodsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SavedPaymentMethods } from './SavedPaymentMethods';

interface QuickWithdrawButtonProps {
  userPoints: number;
}

export const QuickWithdrawButton: React.FC<QuickWithdrawButtonProps> = ({ userPoints }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [defaultMethod, setDefaultMethod] = useState<UserPaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMethodSelection, setShowMethodSelection] = useState(false);

  const minWithdrawal = 1000;
  const maxWithdrawal = Math.min(userPoints, 50000);
  const processingFee = 5; // 5%

  useEffect(() => {
    if (user && isOpen) {
      loadDefaultMethod();
    }
  }, [user, isOpen]);

  const loadDefaultMethod = async () => {
    if (!user) return;
    
    const methods = await paymentMethodsService.getUserPaymentMethods(user.id);
    const defaultMethod = methods.find(method => method.is_default);
    setDefaultMethod(defaultMethod || null);
  };

  const withdrawalAmount = parseInt(amount) || 0;
  const feeAmount = Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;

  const handleQuickWithdraw = async () => {
    if (!user || !defaultMethod) return;

    if (withdrawalAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${minWithdrawal.toLocaleString()} points`);
      return;
    }

    if (withdrawalAmount > userPoints) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
          payout_method: 'flutterwave',
          payment_method_id: defaultMethod.id,
          payout_details: {
            accountNumber: defaultMethod.account_number,
            bankCode: defaultMethod.bank_code,
            accountName: defaultMethod.account_name,
            bankName: defaultMethod.bank_name,
            currency: 'NGN',
            country: 'NG',
            processingFee: feeAmount,
            netAmount: netAmount
          }
        });

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully!');
      setAmount('');
      setIsOpen(false);
      // Optionally refresh the parent component
      window.location.reload();
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: UserPaymentMethod) => {
    setDefaultMethod(method);
    setShowMethodSelection(false);
  };

  const getMethodIcon = (methodType: string, bankName: string) => {
    if (bankName.toLowerCase().includes('opay') || bankName.toLowerCase().includes('palmpay')) {
      return <Smartphone className="h-5 w-5 text-green-500" />;
    }
    if (methodType === 'digital_wallet') {
      return <Wallet className="h-5 w-5 text-blue-500" />;
    }
    return <Building2 className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Quick Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Withdraw</DialogTitle>
        </DialogHeader>

        {showMethodSelection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Payment Method</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowMethodSelection(false)}
              >
                Back
              </Button>
            </div>
            <SavedPaymentMethods 
              showSelectMode={true}
              onSelectMethod={handleMethodSelect}
            />
          </div>
        ) : defaultMethod ? (
          <div className="space-y-6">
            {/* Selected Payment Method */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(defaultMethod.method_type, defaultMethod.bank_name)}
                    <div>
                      <div className="font-medium">{defaultMethod.bank_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {defaultMethod.account_number} • {defaultMethod.account_name}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowMethodSelection(true)}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (Points)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Min: ${minWithdrawal.toLocaleString()}, Max: ${maxWithdrawal.toLocaleString()}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minWithdrawal}
                  max={maxWithdrawal}
                />
              </div>

              {withdrawalAmount >= minWithdrawal && (
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Withdrawal Amount:</span>
                      <span>{withdrawalAmount.toLocaleString()} points</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee ({processingFee}%):</span>
                      <span>-{feeAmount.toLocaleString()} points</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>You'll Receive:</span>
                      <span>{netAmount.toLocaleString()} points (≈ ₦{(netAmount / 1000).toFixed(2)})</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={handleQuickWithdraw}
                disabled={loading || withdrawalAmount < minWithdrawal || withdrawalAmount > userPoints}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Withdraw Now'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Payment Method Found</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to enable quick withdrawals
              </p>
            </div>
            <SavedPaymentMethods />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
