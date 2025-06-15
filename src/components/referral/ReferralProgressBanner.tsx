
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gift, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralProgressBannerProps {
  referralCode: string;
  currentReferrals: number;
  nextMilestone: { required: number; reward: string } | null;
  onCopy: () => void;
  onShare: () => void;
}

export const ReferralProgressBanner: React.FC<ReferralProgressBannerProps> = ({
  referralCode,
  currentReferrals,
  nextMilestone,
  onCopy,
  onShare,
}) => {
  return (
    <div className="bg-gradient-to-r from-yellow-200/80 to-yellow-50 border border-yellow-300 rounded-xl px-6 py-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Badge className="bg-yellow-400 text-black px-3 py-2 text-sm">
          <Gift className="inline w-4 h-4 mr-1" /> Referral Rewards
        </Badge>
        <span className="ml-2 font-medium text-lg">
          {nextMilestone
            ? (
              <>
                Refer <span className="text-yellow-600 font-bold">{nextMilestone.required - currentReferrals}</span> more friend{(nextMilestone.required - currentReferrals) !== 1 ? "s" : ""} to unlock <span className="font-bold">{nextMilestone.reward}</span>
              </>
            ) : (
              <>You've reached our top reward tier! 🎉</>
            )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-1">
          <span className="font-mono text-sm text-gray-700">{referralCode}</span>
        </div>
        <Button onClick={onCopy} size="icon" variant="ghost" className="ml-2" aria-label="Copy">
          <Copy className="w-4 h-4" />
        </Button>
        <Button onClick={onShare} size="icon" variant="ghost" aria-label="Share">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
