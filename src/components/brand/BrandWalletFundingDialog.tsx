import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CreditCard, DollarSign, Info } from "lucide-react";

const fundingSchema = z.object({
  amount: z.number().min(1000, "Minimum funding amount is ₦1,000"),
});

type FundingFormData = z.infer<typeof fundingSchema>;

interface BrandWalletFundingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFundingComplete: () => void;
}

export const BrandWalletFundingDialog: React.FC<BrandWalletFundingDialogProps> = ({
  open,
  onOpenChange,
  onFundingComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      amount: 1000,
    }
  });

  const onSubmit = async (data: FundingFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create payment transaction for wallet funding
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('flutterwave-payment', {
        body: {
          amount: data.amount,
          currency: 'NGN',
          email: user.email!,
          phone_number: user.phone || '+2348000000000',
          name: user.user_metadata?.company_name || user.email!,
          title: 'Wallet Funding',
          description: `Fund brand wallet - Amount: ₦${data.amount.toLocaleString()}`,
          redirect_url: `${window.location.origin}/brand-dashboard?payment=success`,
          meta: {
            user_id: user.id,
            payment_type: 'wallet_funding'
          }
        }
      });

      if (paymentError) throw paymentError;

      if (paymentData?.data?.link) {
        // Open payment page in new window
        const paymentWindow = window.open(paymentData.data.link, '_blank', 'width=800,height=600');
        
        if (paymentWindow) {
          toast.success('Payment window opened. Complete the payment to fund your wallet.');
          
          // Check if window is closed (user completed or cancelled payment)
          const checkClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkClosed);
              // Refresh wallet data after potential payment
              setTimeout(() => {
                onFundingComplete();
              }, 2000);
            }
          }, 1000);
        } else {
          // Fallback: redirect in current window
          window.location.href = paymentData.data.link;
        }
        
        onOpenChange(false);
      } else {
        throw new Error('Failed to create payment link');
      }
    } catch (error: any) {
      console.error('Wallet funding error:', error);
      toast.error('Failed to initiate payment: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fund Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">About Wallet Funding</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add money to your wallet to create and fund campaigns. Once funded, you can create campaigns instantly without additional payments.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="amount">Funding Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                min="1000"
                step="100"
                {...form.register('amount', { valueAsNumber: true })}
                placeholder="1,000"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Minimum amount: ₦1,000</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Payment with Flutterwave</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Live payment processing. You'll be redirected to complete the transaction securely.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Fund Wallet'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};