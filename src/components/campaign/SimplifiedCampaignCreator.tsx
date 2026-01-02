import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Image as ImageIcon, X, Calculator, Wallet, AlertTriangle } from 'lucide-react';
import { useSimpleFormPersistence } from '@/hooks/useSimpleFormPersistence';
import { BudgetEstimateCalculator } from '@/components/brand/BudgetEstimateCalculator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  category: 'brand_assets' | 'campaign_visuals' | 'reference_materials' | 'video_briefs';
  size: number;
}

interface SocialLink {
  platform: string;
  url: string;
  description?: string;
}

interface SocialLinksData {
  website?: string;
  socialProfiles: SocialLink[];
  engagementPosts: string[];
  hashtags: string[];
  mentionRequirements?: string;
}

interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  logo_url: string;
  budget: number;
  target_audience: string;
  requirements: string;
  duration: string;
  mediaAssets: MediaAsset[];
  socialLinks: SocialLinksData;
}

const campaignCategories = [
  'Social Media Marketing',
  'Content Creation',
  'Influencer Marketing',
  'Product Launch',
  'Brand Awareness',
  'Lead Generation',
  'Community Building',
  'User Generated Content',
  'Reviews & Testimonials',
  'Event Promotion'
];

export const SimplifiedCampaignCreator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    category: '',
    logo_url: '',
    budget: 5000,
    target_audience: '',
    requirements: '',
    duration: '7',
    mediaAssets: [],
    socialLinks: {
      socialProfiles: [],
      engagementPosts: [],
      hashtags: []
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [budgetConfirmed, setBudgetConfirmed] = useState(false);

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

  // Auto-save form data
  useSimpleFormPersistence({
    formData,
    setFormData,
    storageKey: 'simplified-campaign-draft',
    enabled: true,
    excludeKeys: ['logo_url']
  });

  // 5 steps now: Essentials, Media & Links, Targeting, Budget Planning, Review
  const steps = [
    { id: 1, title: 'Essentials', description: 'Basic campaign details' },
    { id: 2, title: 'Media & Links', description: 'Upload assets & social links' },
    { id: 3, title: 'Targeting', description: 'Target audience & specs' },
    { id: 4, title: 'Budget Planning', description: 'Plan & confirm your budget' },
    { id: 5, title: 'Review & Submit', description: 'Final review' }
  ];

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CampaignFormData) => {
      if (!user) throw new Error('Not authenticated');

      // First assign brand role if user doesn't have it (for testing)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasBrandRole = roles?.some(r => r.role === 'brand');
      
      if (!hasBrandRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'brand' });
        
        if (roleError) {
          console.error('Failed to assign brand role:', roleError);
          throw new Error('You need brand access to create campaigns. Please contact admin.');
        }
      }

      // CRITICAL: Check wallet balance before creating campaign
      const { data: walletData, error: walletError } = await supabase
        .from('brand_wallets')
        .select('balance')
        .eq('brand_id', user.id)
        .single();

      if (walletError || !walletData) {
        throw new Error('Failed to check wallet balance. Please ensure you have a wallet.');
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
          p_description: `Campaign funding: ${campaignData.title}`
        });

      if (transactionError) {
        throw new Error('Failed to process wallet transaction');
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(campaignData.duration));

      const campaignInsert = {
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
        media_assets: campaignData.mediaAssets as any,
        social_links: campaignData.socialLinks as any,
        status: 'draft' as const,
        admin_approval_status: 'pending' as const,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        campaign_brief: `Campaign created for ${campaignData.category}`,
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
      };

      const { error } = await supabase
        .from('brand_campaigns')
        .insert(campaignInsert);

      if (error) {
        console.error('Campaign creation error details:', error);
        throw new Error(error.message || 'Failed to create campaign');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      localStorage.removeItem('simplified-campaign-draft');
      toast.success('Campaign created and funded successfully!');
      navigate('/brand-dashboard/campaigns');
    },
    onError: (error: any) => {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    },
  });

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

      setFormData(prev => ({ ...prev, logo_url: urlData.publicUrl }));
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
    setFormData(prev => ({ ...prev, logo_url: '' }));
  };

  const updateFormData = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.category);
      case 2:
        return true; // Media and links are optional
      case 3:
        return !!(formData.target_audience);
      case 4:
        return budgetConfirmed && formData.budget >= 300;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (!validateStep(currentStep)) {
      if (currentStep === 4 && !budgetConfirmed) {
        toast.error('Please confirm your budget using the calculator before proceeding');
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBudgetConfirmed = (budget: number, pointsPerTask: number) => {
    setFormData(prev => ({ ...prev, budget }));
    setBudgetConfirmed(true);
  };

  const handleSubmit = () => {
    if (!validateStep(1) || !validateStep(3) || !validateStep(4)) {
      toast.error('Please complete all required fields and confirm your budget');
      return;
    }
    
    // Final wallet check
    if (!wallet || wallet.balance < formData.budget) {
      toast.error(`Insufficient wallet balance. Required: ₦${formData.budget.toLocaleString()}, Available: ₦${wallet?.balance?.toLocaleString() || 0}. Please fund your wallet first.`);
      return;
    }
    
    createCampaignMutation.mutate(formData);
  };

  // Media upload functions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: MediaAsset['category']) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `campaign-media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campaign-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('campaign-media')
          .getPublicUrl(filePath);

        const newAsset: MediaAsset = {
          id: Math.random().toString(36).substring(7),
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
          url: urlData.publicUrl,
          name: file.name,
          category,
          size: file.size
        };

        setFormData(prev => ({
          ...prev,
          mediaAssets: [...prev.mediaAssets, newAsset]
        }));

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      mediaAssets: prev.mediaAssets.filter(asset => asset.id !== assetId)
    }));
  };

  // Social links functions
  const updateSocialLinks = (updates: Partial<SocialLinksData>) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, ...updates }
    }));
  };

  const addSocialProfile = () => {
    updateSocialLinks({
      socialProfiles: [...formData.socialLinks.socialProfiles, { platform: '', url: '', description: '' }]
    });
  };

  const updateSocialProfile = (index: number, field: keyof SocialLink, value: string) => {
    const updatedProfiles = [...formData.socialLinks.socialProfiles];
    updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
    updateSocialLinks({ socialProfiles: updatedProfiles });
  };

  const removeSocialProfile = (index: number) => {
    updateSocialLinks({
      socialProfiles: formData.socialLinks.socialProfiles.filter((_, i) => i !== index)
    });
  };

  const updateHashtags = (hashtagsText: string) => {
    const hashtags = hashtagsText
      .split(/[\s,]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    updateSocialLinks({ hashtags });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter a compelling campaign title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Campaign Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your campaign goals and objectives..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Campaign Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select campaign category" />
                </SelectTrigger>
                <SelectContent>
                  {campaignCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Campaign Logo (Optional)</Label>
              <div className="mt-2">
                {logoPreview || formData.logo_url ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview || formData.logo_url}
                      alt="Campaign logo"
                      className="w-32 h-32 object-contain border border-border rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> campaign logo
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Media Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Media Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Assets */}
                <div>
                  <Label className="text-base font-medium">Brand Assets</Label>
                  <p className="text-sm text-muted-foreground mb-2">Upload logos, brand guidelines, style guides</p>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="brand-assets" className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload brand assets</p>
                      </div>
                      <input
                        id="brand-assets"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'brand_assets')}
                      />
                    </label>
                  </div>
                </div>

                {/* Campaign Visuals */}
                <div>
                  <Label className="text-base font-medium">Campaign Visuals</Label>
                  <p className="text-sm text-muted-foreground mb-2">Upload reference images, mockups, visual inspiration</p>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="campaign-visuals" className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload campaign visuals</p>
                      </div>
                      <input
                        id="campaign-visuals"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, 'campaign_visuals')}
                      />
                    </label>
                  </div>
                </div>

                {/* Uploaded Files */}
                {formData.mediaAssets.length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Uploaded Files</Label>
                    <div className="mt-2 space-y-2">
                      {formData.mediaAssets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">{asset.category} • {(asset.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAsset(asset.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links Section */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links & Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Website */}
                <div>
                  <Label htmlFor="website" className="text-base font-medium">Website/Landing Page</Label>
                  <Input
                    id="website"
                    value={formData.socialLinks.website || ''}
                    onChange={(e) => updateSocialLinks({ website: e.target.value })}
                    placeholder="https://your-website.com"
                    className="mt-2"
                  />
                </div>

                {/* Social Profiles */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium">Social Media Profiles</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialProfile}>
                      Add Profile
                    </Button>
                  </div>
                  {formData.socialLinks.socialProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder="Platform (e.g., Instagram)"
                        value={profile.platform}
                        onChange={(e) => updateSocialProfile(index, 'platform', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Profile URL"
                        value={profile.url}
                        onChange={(e) => updateSocialProfile(index, 'url', e.target.value)}
                        className="flex-2"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialProfile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Hashtags */}
                <div>
                  <Label htmlFor="hashtags" className="text-base font-medium">Required Hashtags</Label>
                  <Input
                    id="hashtags"
                    value={formData.socialLinks.hashtags.join(' ')}
                    onChange={(e) => updateHashtags(e.target.value)}
                    placeholder="#brandname #campaign #hashtag"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Separate hashtags with spaces. # will be added automatically.
                  </p>
                  {formData.socialLinks.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.socialLinks.hashtags.map((tag, index) => (
                        <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="target-audience" className="text-base font-medium">Target Audience *</Label>
              <Input
                id="target-audience"
                value={formData.target_audience}
                onChange={(e) => updateFormData('target_audience', e.target.value)}
                placeholder="e.g., Young professionals aged 25-35 in Lagos"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="requirements" className="text-base font-medium">Campaign Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => updateFormData('requirements', e.target.value)}
                placeholder="Specify any requirements for content creators..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Campaign Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => updateFormData('duration', value)}>
                <SelectTrigger className="mt-2">
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
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calculator className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Plan Your Campaign Budget</h3>
              <p className="text-muted-foreground">
                Use the calculator below to understand your campaign's reach. You must confirm your budget before proceeding.
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
                  Budget confirmed! You can now proceed to review your campaign.
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Review Your Campaign</h3>
              <p className="text-muted-foreground">
                Please review your campaign details before submitting
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Title:</span>
                <span>{formData.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Category:</span>
                <span>{formData.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Budget:</span>
                <span className="text-primary font-bold">₦{formData.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Duration:</span>
                <span>{formData.duration} days</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Target Audience:</span>
                <span>{formData.target_audience}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Media Assets:</span>
                <span>{formData.mediaAssets.length} files</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Social Profiles:</span>
                <span>{formData.socialLinks.socialProfiles.length} profiles</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Hashtags:</span>
                <span>{formData.socialLinks.hashtags.length} tags</span>
              </div>
            </div>

            {/* Wallet Balance Check */}
            <div className={`p-4 rounded-lg border ${wallet && wallet.balance >= formData.budget ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-destructive/10 border-destructive/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className={`w-5 h-5 ${wallet && wallet.balance >= formData.budget ? 'text-green-600' : 'text-destructive'}`} />
                  <span className="font-medium">Wallet Balance</span>
                </div>
                <span className={`text-lg font-bold ${wallet && wallet.balance >= formData.budget ? 'text-green-600' : 'text-destructive'}`}>
                  ₦{wallet?.balance?.toLocaleString() || 0}
                </span>
              </div>
              {wallet && wallet.balance >= formData.budget ? (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Sufficient funds for this campaign
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-destructive">
                    ✗ Insufficient funds. You need ₦{((formData.budget) - (wallet?.balance || 0)).toLocaleString()} more.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/brand-dashboard/wallet')}
                    className="mt-2 text-destructive border-destructive/30"
                  >
                    Fund Wallet
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Your campaign will be submitted for admin review</li>
                <li>• Budget will be deducted from your wallet immediately</li>
                <li>• You'll receive approval notification within 24 hours</li>
                <li>• Once approved, your campaign goes live automatically</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              Create Campaign
            </h1>
            <p className="text-muted-foreground">
              Create your campaign in 5 simple steps
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <div className="ml-2 hidden sm:block">
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
                  <div className={`h-px w-4 sm:w-12 ml-2 sm:ml-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Form Content */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createCampaignMutation.isPending || !wallet || wallet.balance < formData.budget}
                  className="bg-gradient-to-r from-primary to-primary/90"
                >
                  {createCampaignMutation.isPending ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
