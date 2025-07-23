
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { brandWalletService, type BrandWallet } from '@/services/brandWalletService';
import { BrandWalletCard } from '@/components/brand/BrandWalletCard';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<BrandWallet | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    targetAudience: '',
    requirements: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    if (!user) return;
    const walletData = await brandWalletService.getWallet(user.id);
    setWallet(walletData);
  };

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

  const handleCreateFromWallet = async () => {
    if (!validateForm() || !user || !wallet) return;

    const budgetAmount = parseFloat(formData.budget);
    
    // Check if wallet has sufficient balance
    if (wallet.balance < budgetAmount) {
      toast.error(`Insufficient wallet balance. You need ₦${budgetAmount.toLocaleString()} but only have ₦${wallet.balance.toLocaleString()}`);
      return;
    }

    setLoading(true);

    try {
      // Create campaign first
      const { data: campaign, error: campaignError } = await supabase
        .from('brand_campaigns')
        .insert({
          brand_id: user.id,
          title: formData.title,
          description: formData.description,
          budget: budgetAmount,
          status: 'active',
          payment_status: 'paid',
          admin_approval_status: 'pending',
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          target_audience: formData.targetAudience ? { description: formData.targetAudience } : null,
          requirements: formData.requirements ? { description: formData.requirements } : null
        })
        .select('id')
        .single();

      if (campaignError) throw campaignError;

      // Process wallet transaction
      const transactionId = await brandWalletService.processWalletTransaction(
        user.id,
        'campaign_charge',
        budgetAmount,
        `Campaign creation: ${formData.title}`,
        undefined,
        campaign.id
      );

      if (!transactionId) {
        throw new Error('Failed to process wallet transaction');
      }

      // Update campaign with wallet transaction reference
      await supabase
        .from('brand_campaigns')
        .update({ 
          wallet_transaction_id: transactionId
        })
        .eq('id', campaign.id);

      toast.success('Campaign created successfully! It will be reviewed by our team.');
      navigate('/brand-dashboard');

    } catch (error: any) {
      console.error('Campaign creation error:', error);
      toast.error(error.message || 'Failed to create campaign. Please try again.');
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/brand-dashboard')}
            className="border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Campaign</h1>
            <p className="text-muted-foreground">Set up your marketing campaign and fund it to get started</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Balance Warning */}
            {wallet && formData.budget && parseFloat(formData.budget) > wallet.balance && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Insufficient Wallet Balance</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your wallet balance (₦{wallet.balance.toLocaleString()}) is less than the campaign budget (₦{parseFloat(formData.budget).toLocaleString()}). 
                    Please fund your wallet or reduce the budget amount.
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling campaign title"
                    className="border-border bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your campaign objectives and what you want to achieve"
                    rows={4}
                    className="border-border bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-foreground">Budget (NGN) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Enter your campaign budget"
                    min="1000"
                    step="100"
                    className="border-border bg-background text-foreground"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Minimum budget: ₦1,000</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-foreground">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-foreground">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetAudience" className="text-foreground">Target Audience (Optional)</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience demographics and interests"
                    rows={3}
                    className="border-border bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-foreground">Task Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Specific requirements for users completing tasks in this campaign"
                    rows={3}
                    className="border-border bg-background text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <BrandWalletCard onBalanceUpdate={loadWallet} />
            
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign Budget:</span>
                    <span className="font-medium text-foreground">
                      ₦{formData.budget ? parseFloat(formData.budget).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee (1.5%):</span>
                    <span className="font-medium text-foreground">
                      ₦{formData.budget ? (parseFloat(formData.budget) * 0.015).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total Amount:</span>
                      <span className="font-bold text-foreground">
                        ₦{formData.budget ? (parseFloat(formData.budget) * 1.015).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Campaign budget is deducted from your wallet</li>
                  <li>• Your campaign is submitted for admin approval</li>
                  <li>• Once approved, users can start working on your tasks</li>
                  <li>• You can track progress in your dashboard</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleCreateFromWallet}
                disabled={loading || !wallet || (formData.budget && parseFloat(formData.budget) > wallet?.balance)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating Campaign...
                  </div>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Create Campaign from Wallet
                  </>
                )}
              </Button>

              <Button
                onClick={handleSaveDraft}
                disabled={loading}
                variant="outline"
                className="w-full border-border"
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
