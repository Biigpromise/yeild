import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, Wallet, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { brandWalletService } from "@/services/brandWalletService";

interface CampaignSubmissionButtonProps {
  campaign: any;
  onSubmissionComplete: () => void;
}

export const CampaignSubmissionButton: React.FC<CampaignSubmissionButtonProps> = ({
  campaign,
  onSubmissionComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  React.useEffect(() => {
    const checkWalletBalance = async () => {
      if (campaign?.brand_id) {
        const wallet = await brandWalletService.getWallet(campaign.brand_id);
        setWalletBalance(wallet?.balance || 0);
      }
    };
    checkWalletBalance();
  }, [campaign?.brand_id]);

  const canSubmitForApproval = () => {
    return (
      campaign?.status === 'draft' &&
      campaign?.payment_status === 'paid' &&
      walletBalance !== null &&
      walletBalance >= campaign?.budget
    );
  };

  const handleSubmitForApproval = async () => {
    if (!canSubmitForApproval()) {
      if (walletBalance === null || walletBalance < campaign?.budget) {
        toast.error(`Insufficient wallet balance. You need $${campaign?.budget} but have $${walletBalance || 0}. Please fund your wallet first.`);
        return;
      }
      toast.error("Campaign must be paid and have sufficient wallet funds before submission.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('campaign-workflow', {
        body: {
          campaign_id: campaign.id,
          action: 'submit_for_approval'
        }
      });

      if (error) throw error;

      toast.success('Campaign submitted for admin approval! Funds have been deducted from your wallet.');
      onSubmissionComplete();
    } catch (error: any) {
      console.error('Error submitting campaign:', error);
      toast.error('Failed to submit campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = () => {
    if (campaign?.admin_approval_status === 'pending') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-4 w-4 mr-1" />
          Pending Approval
        </Badge>
      );
    }

    if (campaign?.admin_approval_status === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 mr-1" />
          Approved
        </Badge>
      );
    }

    if (campaign?.admin_approval_status === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4 mr-1" />
          Rejected
        </Badge>
      );
    }

    return null;
  };

  const getRequirementMessages = () => {
    const messages = [];
    
    if (campaign?.payment_status !== 'paid') {
      messages.push("❌ Campaign must be funded");
    } else {
      messages.push("✅ Campaign funded");
    }

    if (walletBalance === null) {
      messages.push("⏳ Checking wallet balance...");
    } else if (walletBalance < campaign?.budget) {
      messages.push(`❌ Insufficient wallet balance ($${walletBalance.toFixed(2)} < $${campaign?.budget})`);
    } else {
      messages.push(`✅ Sufficient wallet balance ($${walletBalance.toFixed(2)})`);
    }

    return messages;
  };

  return (
    <div className="space-y-4">
      {/* Submission Status */}
      {getSubmissionStatus()}

      {/* Requirements Check */}
      {campaign?.status === 'draft' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Submission Requirements
          </h4>
          <div className="space-y-1 text-sm">
            {getRequirementMessages().map((message, index) => (
              <p key={index} className="text-blue-800">{message}</p>
            ))}
          </div>
          
          {!canSubmitForApproval() && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Once submitted, $${campaign?.budget} will be deducted from your wallet. 
                If the campaign is rejected, you'll receive a full refund.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {campaign?.status === 'draft' && campaign?.admin_approval_status !== 'pending' && (
        <Button
          onClick={handleSubmitForApproval}
          disabled={!canSubmitForApproval() || loading}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Submitting...' : 'Submit for Admin Approval'}
        </Button>
      )}

      {/* Rejection Reason */}
      {campaign?.rejection_reason && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-medium">Rejection Reason:</p>
              <p className="text-red-800 text-sm">{campaign.rejection_reason}</p>
              <p className="text-red-700 text-xs mt-2">
                A full refund of $${campaign?.budget} has been processed to your wallet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};