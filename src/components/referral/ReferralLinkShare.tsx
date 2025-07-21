
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, MessageSquare, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralLinkShareProps {
  referralCode: string;
}

export const ReferralLinkShare: React.FC<ReferralLinkShareProps> = ({ referralCode }) => {
  const { user } = useAuth();
  const [shareMethod, setShareMethod] = useState<'link' | 'whatsapp' | 'email'>('link');
  
  // Use our custom domain for referral links
  const baseUrl = 'https://yeildhive.com'; // Our main domain
  const referralLink = `${baseUrl}/signup?ref=${referralCode}`;
  
  const shareMessage = `🚀 Join YEILD and start earning points for completing simple tasks! 

Use my referral code: ${referralCode}

Sign up here: ${referralLink}

💰 Earn points, complete tasks, and get rewarded!
🎯 Easy tasks from top brands
💸 Withdraw your earnings

Let's grow together! 🌟`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success('Share message copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Join YEILD and Start Earning!');
    const body = encodeURIComponent(shareMessage);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  const handleSocialShare = (platform: string) => {
    const encodedMessage = encodeURIComponent(shareMessage);
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodedMessage}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodedMessage}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Link */}
        <div className="space-y-2">
          <Label>Your Referral Link</Label>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <Label>Your Referral Code</Label>
          <div className="flex gap-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="font-mono text-center font-bold text-lg"
            />
            <Button 
              onClick={() => navigator.clipboard.writeText(referralCode)} 
              variant="outline" 
              size="icon"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Message */}
        <div className="space-y-2">
          <Label>Share Message</Label>
          <div className="space-y-3">
            <textarea 
              value={shareMessage}
              readOnly
              className="w-full p-3 border rounded-md text-sm resize-none h-32 bg-muted/50"
            />
            <Button onClick={handleCopyMessage} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Share Message
            </Button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="space-y-3">
          <Label>Quick Share</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleWhatsAppShare} variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button onClick={handleEmailShare} variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button onClick={() => handleSocialShare('twitter')} variant="outline" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Twitter
            </Button>
            <Button onClick={() => handleSocialShare('telegram')} variant="outline" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Telegram
            </Button>
          </div>
        </div>

        {/* Referral Stats Preview */}
        <div className="p-4 bg-yeild-yellow/10 rounded-lg border border-yeild-yellow/20">
          <h4 className="font-semibold text-yeild-yellow mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-muted-foreground">
            Share your referral link with friends and family. You'll earn bonus points when they join and become active users!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
