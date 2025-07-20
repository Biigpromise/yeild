import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Calendar, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CampaignFundingProps {
  campaignId?: string;
  existingCampaign?: {
    title: string;
    budget: number;
    description: string;
  };
}

export const CampaignFunding = ({ campaignId, existingCampaign }: CampaignFundingProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: existingCampaign?.title || "",
    description: existingCampaign?.description || "",
    budget: existingCampaign?.budget?.toString() || "",
    currency: "NGN",
    startDate: "",
    endDate: "",
    targetAudience: "",
    requirements: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push("Campaign title is required");
    if (!formData.budget || parseFloat(formData.budget) <= 0) errors.push("Valid budget amount is required");
    if (!formData.description.trim()) errors.push("Campaign description is required");
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      // First create or update campaign
      let currentCampaignId = campaignId;
      
      if (!currentCampaignId) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            brand_id: user.id,
            title: formData.title,
            description: formData.description,
            budget: parseFloat(formData.budget),
            status: 'draft',
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            target_audience: formData.targetAudience ? { description: formData.targetAudience } : null,
            requirements: formData.requirements ? { description: formData.requirements } : null
          })
          .select('id')
          .single();

        if (campaignError) throw campaignError;
        currentCampaignId = campaign.id;
      }

      // Initialize payment with Flutterwave
      const paymentPayload = {
        amount: parseFloat(formData.budget),
        currency: formData.currency,
        email: user.email!,
        phone_number: user.phone || "",
        name: user.user_metadata?.full_name || user.email!,
        title: `Campaign Funding: ${formData.title}`,
        description: `Fund campaign "${formData.title}" with budget of ${formData.currency} ${formData.budget}`,
        redirect_url: `${window.location.origin}/campaign/payment-success?campaign_id=${currentCampaignId}`,
        meta: {
          user_id: user.id,
          payment_type: "campaign_funding",
          campaign_id: currentCampaignId
        }
      };

      console.log("Initiating campaign funding payment:", paymentPayload);

      const { data: paymentResponse, error: paymentError } = await supabase.functions
        .invoke('flutterwave-payment', {
          body: paymentPayload
        });

      if (paymentError) throw paymentError;

      if (paymentResponse?.data?.link) {
        // Redirect to Flutterwave payment page
        window.location.href = paymentResponse.data.link;
      } else {
        throw new Error("Payment link not received");
      }

    } catch (error) {
      console.error('Campaign funding error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const budgetAmount = parseFloat(formData.budget) || 0;
  const processingFee = budgetAmount * 0.015; // 1.5% fee
  const totalAmount = budgetAmount + processingFee;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter campaign title"
              disabled={!!existingCampaign}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign objectives and requirements"
              rows={3}
              disabled={!!existingCampaign}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Amount</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GHS">Ghanaian Cedi (GH₵)</SelectItem>
                  <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Describe your target audience"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Task Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Specific requirements for task completion"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {budgetAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Campaign Budget:</span>
                <span>{formData.currency} {budgetAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee (1.5%):</span>
                <span>{formData.currency} {processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>{formData.currency} {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fund Campaign
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You'll be redirected to Flutterwave for secure payment</li>
                <li>• Once paid, your campaign will be activated</li>
                <li>• Users can start working on your campaign tasks</li>
                <li>• Payments to users are processed automatically upon task completion</li>
              </ul>
            </div>
            
            <Button 
              onClick={handlePayment}
              disabled={loading || !formData.title || !formData.budget}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Pay ${formData.currency} ${totalAmount.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};