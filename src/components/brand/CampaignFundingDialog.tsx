
import React from "react";
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
import { CreditCard, DollarSign } from "lucide-react";
import type { BrandCampaign } from "@/hooks/useBrandCampaigns";

const fundingSchema = z.object({
  amount: z.number().min(10, "Minimum funding amount is $10"),
});

type FundingFormData = z.infer<typeof fundingSchema>;

interface CampaignFundingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: BrandCampaign | null;
  onFundingComplete: () => void;
}

export const CampaignFundingDialog: React.FC<CampaignFundingDialogProps> = ({
  open,
  onOpenChange,
  campaign,
  onFundingComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      amount: 10,
    }
  });

  const onSubmit = async (data: FundingFormData) => {
    if (!user || !campaign) return;
    
    setLoading(true);
    try {
      // Create payment transaction
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('flutterwave-payment', {
        body: {
          amount: data.amount,
          currency: 'USD',
          customer_name: user.user_metadata.company_name || user.email,
          customer_email: user.email,
          payment_type: 'campaign_funding',
          campaign_id: campaign.id,
          redirect_url: `${window.location.origin}/brand-dashboard?payment=success`
        }
      });

      if (paymentError) throw paymentError;

      if (paymentData?.payment_link) {
        // Open payment page in new tab
        window.open(paymentData.payment_link, '_blank');
        toast.success('Payment window opened. Complete the payment to fund your campaign.');
        onOpenChange(false);
      } else {
        throw new Error('Failed to create payment link');
      }
    } catch (error: any) {
      toast.error('Failed to initiate payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fund Campaign
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700">Campaign Details</h3>
            <p className="font-semibold">{campaign.title}</p>
            <p className="text-sm text-gray-600">
              Budget: ${campaign.budget.toFixed(2)} | 
              Funded: ${campaign.funded_amount.toFixed(2)}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="amount">Funding Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                step="0.01"
                {...form.register('amount', { valueAsNumber: true })}
                placeholder="10.00"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Payment with Flutterwave</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Your payment will be processed securely. You'll be redirected to complete the transaction.
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
                {loading ? 'Processing...' : 'Fund Campaign'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
