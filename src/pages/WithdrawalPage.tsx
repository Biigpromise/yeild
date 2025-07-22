import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BankVerification } from '@/components/withdrawal/BankVerification';

interface WithdrawalMethod {
  id: string;
  type?: string;
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}

const WithdrawalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [showBankVerification, setShowBankVerification] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserBalance();
      loadWithdrawalMethods();
    }
  }, [user]);

  const loadUserBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserBalance(data?.points || 0);
    } catch (error: any) {
      console.error('Error loading balance:', error);
      toast.error('Failed to load balance');
    }
  };

  const loadWithdrawalMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crypto_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('crypto_type', 'bank_account');

      if (error) throw error;
      
      // Transform the data to match WithdrawalMethod interface
      const methods: WithdrawalMethod[] = (data || []).map(item => ({
        id: item.id,
        account_number: item.wallet_address,
        account_name: 'Account Holder', // This should be stored/retrieved separately
        bank_code: item.network || '',
        bank_name: 'Bank Name' // This should be retrieved from bank code
      }));
      
      setWithdrawalMethods(methods);
    } catch (error: any) {
      console.error('Error loading withdrawal methods:', error);
    }
  };

  const handleWithdrawal = async () => {
    if (!user || !selectedMethod || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const method = withdrawalMethods.find(m => m.id === selectedMethod);
      if (!method) {
        throw new Error('Selected withdrawal method not found');
      }

      // Call the Flutterwave transfer edge function
      const { data, error } = await supabase.functions.invoke('flutterwave-transfer', {
        body: {
          account_bank: method.bank_code,
          account_number: method.account_number,
          amount: withdrawalAmount,
          narration: 'Withdrawal from Yield Platform',
          beneficiary_name: method.account_name,
          reference: `WD_${Date.now()}_${user.id.slice(0, 8)}`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Withdrawal request submitted successfully!');
        setAmount('');
        setSelectedMethod('');
        loadUserBalance();
      } else {
        throw new Error(data.error || 'Withdrawal failed');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleBankVerified = (bankDetails: any) => {
    setShowBankVerification(false);
    loadWithdrawalMethods();
    toast.success('Bank account verified and added successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Withdraw Funds</h1>
            <p className="text-muted-foreground">Withdraw your earnings to your bank account</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ₦{userBalance.toLocaleString()}
            </div>
            <p className="text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                min="100"
                max={userBalance}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum withdrawal: ₦100
              </p>
            </div>

            <div>
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  {withdrawalMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.bank_name} - {method.account_number} ({method.account_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {withdrawalMethods.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No withdrawal methods found. Please add a bank account first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setShowBankVerification(true)}
                variant="outline"
                className="w-full"
              >
                Add New Bank Account
              </Button>

              <Button
                onClick={handleWithdrawal}
                disabled={loading || !selectedMethod || !amount || parseFloat(amount) <= 0}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Withdrawals are processed within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Minimum withdrawal amount is ₦100</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Bank transfer fees may apply</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <BankVerification
          open={showBankVerification}
          onOpenChange={setShowBankVerification}
          onBankVerified={handleBankVerified}
        />
      </div>
    </div>
  );
};

export default WithdrawalPage;