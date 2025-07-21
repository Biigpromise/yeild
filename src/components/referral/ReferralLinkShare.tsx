
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ReferralLinkShareProps {
  referralCode: string;
  customDomain?: string;
}

export const ReferralLinkShare: React.FC<ReferralLinkShareProps> = ({ 
  referralCode, 
  customDomain = "yeildsocials.com" 
}) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://${customDomain}/signup?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join YIELD",
          text: "Join me on YIELD and start earning rewards!",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm break-all">
            {referralLink}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={shareLink} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
          <Button onClick={copyToClipboard} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Your referral code:</strong> {referralCode}</p>
          <p>Share this link with friends to earn rewards when they join!</p>
        </div>
      </CardContent>
    </Card>
  );
};
