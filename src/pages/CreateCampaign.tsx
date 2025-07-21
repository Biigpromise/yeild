
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    targetAudience: '',
    requirements: '',
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Campaign title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Campaign description is required');
      return false;
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      toast.error('Valid budget amount is required');
      return false;
    }
    return true;
  };

  const handleCreateAndPay = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      // Create campaign first
      const { data: campaign, error: campaignError } = await supabase
        .from('brand_campaigns')
        .insert({
          brand_id: user.id,
          title: formData.title,
          description: formData.description,
          budget: parseFloat(formData.budget),
          status: 'draft',
          payment_status: 'unpaid',
          admin_approval_status: 'pending',
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          target_audience: formData.targetAudience ? { description: formData.targetAudience } : null,
          requirements: formData.requirements ? { description: formData.requirements } : null
        })
        .select('id')
        .single();

      if (campaignError) throw campaignError;

      // Initialize Flutterwave payment
      const paymentPayload = {
        amount: parseFloat(formData.budget),
        currency: 'NGN',
        email: user.email!,
        phone_number: user.phone || '+2348000000000',
        name: user.user_metadata?.company_name || user.email!,
        title: `Campaign: ${formData.title}`,
        description: `Fund campaign "${formData.title}" - Budget: ₦${parseFloat(formData.budget).toLocaleString()}`,
        redirect_url: `${window.location.origin}/campaigns/${campaign.id}/payment-success`,
        meta: {
          user_id: user.id,
          payment_type: 'campaign_funding',
          campaign_id: campaign.id
        }
      };

      const { data: paymentResponse, error: paymentError } = await supabase.functions
        .invoke('flutterwave-payment', {
          body: paymentPayload
        });

      if (paymentError) throw paymentError;

      if (paymentResponse?.payment_link) {
        // Update campaign with payment reference
        await supabase
          .from('brand_campaigns')
          .update({ 
            payment_status: 'pending'
          })
          .eq('id', campaign.id);

        // Redirect to Flutterwave payment page
        window.location.href = paymentResponse.payment_link;
      } else {
        throw new Error('Payment link not received');
      }

    } catch (error: any) {
      console.error('Campaign creation error:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data: campaign, error } = await supabase
        .from('brand_campaigns')
        .insert({
          brand_id: user.id,
          title: formData.title || 'Untitled Campaign',
          description: formData.description,
          budget: parseFloat(formData.budget) || 0,
          status: 'draft',
          payment_status: 'unpaid',
          admin_approval_status: 'pending',
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          target_audience: formData.targetAudience ? { description: formData.targetAudience } : null,
          requirements: formData.requirements ? { description: formData.requirements } : null
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Campaign saved as draft');
      navigate('/brand-dashboard');

    } catch (error: any) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/brand-dashboard')}
            className="border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black">Create New Campaign</h1>
            <p className="text-gray-600">Set up your marketing campaign and fund it to get started</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-black">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling campaign title"
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-black">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your campaign objectives and what you want to achieve"
                    rows={4}
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-black">Budget (NGN) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Enter your campaign budget"
                    min="1000"
                    step="100"
                    className="border-gray-300"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum budget: ₦1,000</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-black">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-black">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetAudience" className="text-black">Target Audience (Optional)</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience demographics and interests"
                    rows={3}
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-black">Task Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Specific requirements for users completing tasks in this campaign"
                    rows={3}
                    className="border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign Budget:</span>
                    <span className="font-medium text-black">
                      ₦{formData.budget ? parseFloat(formData.budget).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee (1.5%):</span>
                    <span className="font-medium text-black">
                      ₦{formData.budget ? (parseFloat(formData.budget) * 0.015).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Total Amount:</span>
                      <span className="font-bold text-black">
                        ₦{formData.budget ? (parseFloat(formData.budget) * 1.015).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Payment is processed securely via Flutterwave</li>
                  <li>• Your campaign is submitted for admin approval</li>
                  <li>• Once approved, users can start working on your tasks</li>
                  <li>• You can track progress in your dashboard</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleCreateAndPay}
                disabled={loading}
                className="w-full bg-black text-white hover:bg-gray-800"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Create & Pay Now
                  </>
                )}
              </Button>

              <Button
                onClick={handleSaveDraft}
                disabled={loading}
                variant="outline"
                className="w-full border-gray-300"
                size="lg"
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
