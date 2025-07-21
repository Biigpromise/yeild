import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Send } from 'lucide-react';

export const PaymentTester = () => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '1000',
    email: 'test@example.com',
    name: 'Test User',
    phone: '08012345678',
    paymentType: 'general' as const
  });
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    txRef: ''
  });
  const { toast } = useToast();

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flutterwave-payment', {
        body: {
          amount: parseFloat(paymentData.amount),
          email: paymentData.email,
          name: paymentData.name,
          phone: paymentData.phone,
          payment_type: paymentData.paymentType,
          currency: 'NGN'
        }
      });

      if (error) throw error;

      if (data?.payment_link) {
        toast({
          title: "Payment Link Generated",
          description: "Opening payment window...",
        });
        
        // Open payment link in new window
        window.open(data.payment_link, '_blank', 'width=600,height=600');
        
        // Store transaction reference for verification
        if (data.tx_ref) {
          setVerificationData(prev => ({ ...prev, txRef: data.tx_ref }));
        }
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!verificationData.transactionId && !verificationData.txRef) {
      toast({
        title: "Missing Data",
        description: "Please enter either Transaction ID or TX Reference",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flutterwave-verify', {
        body: {
          transaction_id: verificationData.transactionId || undefined,
          tx_ref: verificationData.txRef || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Verification Complete",
        description: `Payment status: ${data.status}`,
      });

      console.log('Verification result:', data);
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={paymentData.paymentType}
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="campaign_funding">Campaign Funding</SelectItem>
                  <SelectItem value="task_payment">Task Payment</SelectItem>
                  <SelectItem value="premium_subscription">Premium Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={paymentData.email}
                onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={paymentData.name}
                onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Test User"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={paymentData.phone}
              onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="08012345678"
            />
          </div>

          <Button onClick={initiatePayment} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Initiate Test Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Payment Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="transactionId">Transaction ID (from Flutterwave)</Label>
            <Input
              id="transactionId"
              value={verificationData.transactionId}
              onChange={(e) => setVerificationData(prev => ({ ...prev, transactionId: e.target.value }))}
              placeholder="Enter transaction ID"
            />
          </div>

          <div>
            <Label htmlFor="txRef">TX Reference (auto-filled from payment)</Label>
            <Input
              id="txRef"
              value={verificationData.txRef}
              onChange={(e) => setVerificationData(prev => ({ ...prev, txRef: e.target.value }))}
              placeholder="TX reference"
            />
          </div>

          <Button onClick={verifyPayment} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Verify Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>1.</strong> Fill in the payment details above and click "Initiate Test Payment"</p>
          <p><strong>2.</strong> A Flutterwave payment window will open - use test card details</p>
          <p><strong>3.</strong> After payment, copy the transaction ID from the success page</p>
          <p><strong>4.</strong> Paste it in the verification section and click "Verify Payment"</p>
          <p><strong>Test Card:</strong> 4187427415564246, CVV: 828, Expiry: 09/32, PIN: 3310</p>
        </CardContent>
      </Card>
    </div>
  );
};