
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, DollarSign, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BrandPayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'NGN',
    purpose: 'account_funding'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    if (parseFloat(formData.amount) < 1000) {
      toast.error('Minimum funding amount is ₦1,000');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      const paymentPayload = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        email: user.email!,
        phone_number: user.phone || '+2348000000000',
        name: user.user_metadata?.company_name || user.email!,
        title: `Account Funding - ${formData.currency} ${formData.amount}`,
        description: `Fund YIELD brand account with ${formData.currency} ${parseFloat(formData.amount).toLocaleString()}`,
        redirect_url: `${window.location.origin}/brand-dashboard?payment=success`,
        meta: {
          user_id: user.id,
          payment_type: formData.purpose,
          currency: formData.currency
        }
      };

      const { data: paymentResponse, error: paymentError } = await supabase.functions
        .invoke('flutterwave-payment', {
          body: paymentPayload
        });

      if (paymentError) throw paymentError;

      if (paymentResponse?.payment_link) {
        toast.success('Redirecting to payment gateway...');
        window.location.href = paymentResponse.payment_link;
      } else {
        throw new Error('Payment link not received');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const amount = parseFloat(formData.amount) || 0;
  const processingFee = amount * 0.015;
  const totalAmount = amount + processingFee;

  return (
    <div className="min-h-screen bg-yeild-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/brand-dashboard')}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Fund Your Account</h1>
            <p className="text-gray-300">Add funds to your YIELD brand account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-white">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount to fund"
                    min="1000"
                    step="100"
                    className="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  />
                  <p className="text-sm text-gray-400 mt-1">Minimum: ₦1,000</p>
                </div>

                <div>
                  <Label htmlFor="currency" className="text-white">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger className="border-gray-600 bg-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="GHS">Ghanaian Cedi (GH₵)</SelectItem>
                      <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="purpose" className="text-white">Purpose</Label>
                  <Select value={formData.purpose} onValueChange={(value) => handleInputChange('purpose', value)}>
                    <SelectTrigger className="border-gray-600 bg-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="account_funding">Account Funding</SelectItem>
                      <SelectItem value="campaign_prepay">Campaign Prepayment</SelectItem>
                      <SelectItem value="credit_top_up">Credit Top-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <Label className="text-white">Quick Select</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[5000, 10000, 25000, 50000].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount: quickAmount.toString() }))}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        ₦{quickAmount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Funds will be available in your account immediately after successful payment</li>
                  <li>• You can use account funds for campaign creation and management</li>
                  <li>• All payments are processed securely via Flutterwave</li>
                  <li>• A 1.5% processing fee applies to all transactions</li>
                  <li>• Funds are non-refundable but can be used for any YIELD services</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {amount > 0 && (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Amount:</span>
                      <span className="font-medium text-white">
                        {formData.currency} {amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Processing Fee (1.5%):</span>
                      <span className="font-medium text-white">
                        {formData.currency} {processingFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-white">Total Amount:</span>
                        <span className="font-bold text-yeild-yellow text-lg">
                          {formData.currency} {totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl">🔒</div>
                  <p className="text-sm text-gray-300">
                    Your payment is secured by Flutterwave's industry-leading encryption and security measures.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              disabled={loading || !formData.amount || parseFloat(formData.amount) < 1000}
              className="w-full bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow-dark font-semibold"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yeild-black/30 border-t-yeild-black rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {formData.currency} {totalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPayment;
