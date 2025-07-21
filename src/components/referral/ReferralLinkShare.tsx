
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Check, QrCode, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { generateReferralLink } from "@/config/app";

interface ReferralLinkShareProps {
  referralCode: string;
}

export const ReferralLinkShare: React.FC<ReferralLinkShareProps> = ({ 
  referralCode
}) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = generateReferralLink(referralCode);
  const shareMessage = `Join me on YIELD and start earning rewards! Use my referral code: ${referralCode} or click this link: ${referralLink}`;

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

  const shareViaWebShare = async () => {
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

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join YIELD - Referral Invitation');
    const body = encodeURIComponent(`Hi there!\n\nI'd love to invite you to join YIELD, where you can earn rewards for completing tasks.\n\nUse my referral code: ${referralCode}\nOr click this link: ${referralLink}\n\nLet's start earning together!`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  const shareViaTwitter = () => {
    const twitterText = encodeURIComponent(`Join me on YIELD and start earning rewards! Use my referral code: ${referralCode}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(referralLink)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm break-all border">
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

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={shareViaWebShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </div>

        {/* Social Media Share Options */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Share on:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              onClick={shareViaTwitter}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>
        
        {/* Referral Code Display */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Your referral code:</strong> <span className="font-mono">{referralCode}</span></p>
            <p>Share this link with friends to earn rewards when they join and become active!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
