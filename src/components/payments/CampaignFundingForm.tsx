import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Target, Users, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  funded_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  target_audience: any;
}

interface CampaignFundingFormProps {
  campaign: Campaign;
  onFundingComplete?: () => void;
}

export const CampaignFundingForm: React.FC<CampaignFundingFormProps> = ({
  campaign,
  onFundingComplete
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fundingProgress = (campaign.funded_amount / campaign.budget) * 100;
  const remainingAmount = campaign.budget - campaign.funded_amount;

  const handleFundCampaign = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to fund campaigns",
        variant: "destructive"
      });
      return;
    }

    const fundingAmount = parseFloat(amount);
    if (!fundingAmount || fundingAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid funding amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flutterwave-payment', {
        body: {
          amount: fundingAmount,
          email: user.email,
          name: user.email?.split('@')[0] || 'Brand User',
          phone: '+2348000000000', // Default phone number
          payment_type: 'campaign_funding',
          currency: 'NGN',
          campaign_id: campaign.id,
          redirect_url: `${window.location.origin}/campaigns/${campaign.id}?funding=success`
        }
      });

      if (error) throw error;

      if (data?.payment_link) {
        toast({
          title: "Redirecting to Payment",
          description: "Opening secure payment window...",
        });
        
        // Redirect to Flutterwave payment page
        window.location.href = data.payment_link;
      }
    } catch (error) {
      console.error('Campaign funding error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate campaign funding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Funding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{campaign.title}</h3>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Funding Progress</span>
              <span>₦{campaign.funded_amount.toLocaleString()} / ₦{campaign.budget.toLocaleString()}</span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{fundingProgress.toFixed(1)}% funded</span>
              <span>₦{remainingAmount.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Status:</span>
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fund This Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Funding Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to fund"
              min="100"
              max={remainingAmount}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum: ₦100 • Maximum: ₦{remainingAmount.toLocaleString()}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1000, 5000, 10000, remainingAmount].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={quickAmount > remainingAmount}
              >
                ₦{quickAmount.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Funding Benefits</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Support innovative marketing campaigns</li>
              <li>• Get priority access to campaign results</li>
              <li>• Build relationships with influencers</li>
              <li>• Secure payment processing via Flutterwave</li>
            </ul>
          </div>

          <Button
            onClick={handleFundCampaign}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Fund Campaign - ₦{amount ? parseFloat(amount).toLocaleString() : '0'}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By funding this campaign, you agree to our terms of service. 
            Payments are processed securely by Flutterwave.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};