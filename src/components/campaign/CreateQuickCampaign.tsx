import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Zap, Target, Clock, Upload, Image as ImageIcon, X, CheckCircle, Calculator, AlertTriangle, Wallet } from 'lucide-react';
import { BudgetEstimateCalculator } from '@/components/brand/BudgetEstimateCalculator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuickCampaignFormData {
  title: string;
  description: string;
  budget: number;
  target_audience: string;
  requirements: string;
  category: string;
  duration: string;
  logo_url: string;
}

export const CreateQuickCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetConfirmed, setBudgetConfirmed] = useState(false);
  
  const [formData, setFormData] = useState<QuickCampaignFormData>({
    title: '',
    description: '',
    budget: 5000,
    target_audience: '',
    requirements: '',
    category: '',
    duration: '7',
    logo_url: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['brand-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('brand_wallets')
        .select('balance')
        .eq('brand_id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id
  });

  const steps = [
    { id: 1, title: 'Campaign Details', description: 'Basic information' },
    { id: 2, title: 'Budget Planning', description: 'Plan & confirm budget' }
  ];

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: QuickCampaignFormData) => {
      if (!user) throw new Error('Not authenticated');

      // Check wallet balance and fund campaign
      const { data: walletData, error: walletError } = await supabase
        .from('brand_wallets')
        .select('balance')
        .eq('brand_id', user.id)
        .single();

      if (walletError || !walletData) {
        throw new Error('Failed to check wallet balance');
      }

      if (walletData.balance < campaignData.budget) {
        throw new Error(`Insufficient wallet balance. Required: ₦${campaignData.budget.toLocaleString()}, Available: ₦${walletData.balance.toLocaleString()}. Please fund your wallet first.`);
      }

      // Process wallet transaction
      const { data: transaction, error: transactionError } = await supabase
        .rpc('process_wallet_transaction', {
          p_brand_id: user.id,
          p_transaction_type: 'campaign_charge',
          p_amount: campaignData.budget,
          p_description: `Quick Campaign funding: ${campaignData.title}`
        });

      if (transactionError) {
        throw new Error('Failed to process wallet transaction');
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(campaignData.duration));

      const { error } = await supabase
        .from('brand_campaigns')
        .insert([{
          brand_id: user.id,
          title: campaignData.title,
          description: campaignData.description,
          logo_url: campaignData.logo_url,
          budget: campaignData.budget,
          funded_amount: campaignData.budget,
          payment_status: 'paid',
          wallet_transaction_id: transaction,
          target_audience: { description: campaignData.target_audience },
          requirements: { 
            description: campaignData.requirements,
            category: campaignData.category
          },
          status: 'draft',
          admin_approval_status: 'pending',
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          campaign_brief: `Quick campaign created for ${campaignData.category}`,
          deliverable_specifications: {
            deliverables: [
              {
                type: 'social_post',
                platform: 'instagram',
                quantity: 1,
                requirements: campaignData.requirements
              }
            ],
            contentGuidelines: 'Follow brand guidelines and campaign requirements',
            brandVoice: 'Professional and engaging'
          }
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      toast.success('Quick campaign created and funded successfully!');
      navigate('/brand-dashboard/campaigns');
    },
    onError: (error: any) => {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    },
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!budgetConfirmed) {
      toast.error('Please confirm your budget before creating the campaign');
      return;
    }

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    if (!wallet || wallet.balance < formData.budget) {
      toast.error(`Insufficient wallet balance. Required: ₦${formData.budget.toLocaleString()}, Available: ₦${wallet?.balance?.toLocaleString() || 0}. Please fund your wallet first.`);
      return;
    }

    createCampaignMutation.mutate(formData);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `campaign-logo-${Date.now()}.${fileExt}`;
      const filePath = `campaign-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('campaign-media')
        .getPublicUrl(filePath);

      updateFormData('logo_url', urlData.publicUrl);
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
      setLogoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    updateFormData('logo_url', '');
  };

  const updateFormData = (field: keyof QuickCampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBudgetConfirmed = (budget: number, pointsPerTask: number) => {
    setFormData(prev => ({ ...prev, budget }));
    setBudgetConfirmed(true);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description);
      case 2:
        return budgetConfirmed && formData.budget >= 300;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 2) {
      setCurrentStep(2);
    } else if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Campaign Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter a compelling campaign title"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Campaign Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your campaign objectives and key messaging"
                rows={3}
                required
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Campaign Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                    <SelectItem value="product_launch">Product Launch</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="lead_generation">Lead Generation</SelectItem>
                    <SelectItem value="sales_promotion">Sales Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Campaign Duration
                </Label>
                <Select value={formData.duration} onValueChange={(value) => updateFormData('duration', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Campaign Logo (Optional)</Label>
              <div className="mt-1">
                {logoPreview || formData.logo_url ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview || formData.logo_url}
                      alt="Campaign logo"
                      className="w-24 h-24 object-contain border border-border rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center">
                        {uploading ? (
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Upload logo</p>
                          </>
                        )}
                      </div>
                      <input
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="target-audience" className="text-sm font-medium">
                Target Audience
              </Label>
              <Input
                id="target-audience"
                value={formData.target_audience}
                onChange={(e) => updateFormData('target_audience', e.target.value)}
                placeholder="e.g., Young professionals aged 25-35 in Lagos"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="requirements" className="text-sm font-medium">
                Campaign Requirements
              </Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => updateFormData('requirements', e.target.value)}
                placeholder="Specify any requirements for content creators..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calculator className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Plan Your Campaign Budget</h3>
              <p className="text-muted-foreground">
                Use the calculator to understand your campaign's reach. You must confirm your budget before creating the campaign.
              </p>
            </div>

            {/* Wallet Balance Warning */}
            {wallet && wallet.balance < 1000 && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Your wallet balance is low (₦{wallet.balance.toLocaleString()}). Fund your wallet to create campaigns.</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/brand-dashboard/wallet')}
                    className="ml-4"
                  >
                    Fund Wallet
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Budget Calculator - MANDATORY */}
            <BudgetEstimateCalculator 
              onBudgetConfirmed={handleBudgetConfirmed}
              walletBalance={wallet?.balance}
              isRequired={true}
              initialBudget={formData.budget}
            />

            {budgetConfirmed && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-700 dark:text-green-300">
                  Budget confirmed: ₦{formData.budget.toLocaleString()}
                </p>
              </div>
            )}

            {/* Summary */}
            {budgetConfirmed && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium text-primary">₦{formData.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{formData.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet Balance:</span>
                    <span className={`font-medium ${wallet && wallet.balance >= formData.budget ? 'text-green-600' : 'text-destructive'}`}>
                      ₦{wallet?.balance?.toLocaleString() || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/brand-dashboard')}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              Quick Campaign Creator
            </h1>
            <p className="text-muted-foreground">
              Create and launch your campaign in 2 simple steps
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <div className="ml-3 flex-1">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px flex-1 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 ? (
                <>
                  <Target className="h-5 w-5 text-primary" />
                  Campaign Details
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 text-primary" />
                  Budget Planning
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-6">
              {currentStep === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/brand-dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(1)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                  >
                    Next: Budget Planning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createCampaignMutation.isPending || !budgetConfirmed || !wallet || wallet.balance < formData.budget}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    {createCampaignMutation.isPending ? (
                      <>Creating Campaign...</>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Create Quick Campaign
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-dashed bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <h4 className="font-medium text-foreground mb-1">Quick Campaign Benefits</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Fast approval process (usually within 24 hours)</li>
                  <li>• Simplified requirements for content creators</li>
                  <li>• Automatic wallet deduction - no payment hassle</li>
                  <li>• Budget must be confirmed before campaign creation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
