import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { brandWalletService, type BrandWallet } from '@/services/brandWalletService';

import { MediaUploadSection } from './MediaUploadSection';
import { SocialLinksSection } from './SocialLinksSection';
import { CampaignBriefSection } from './CampaignBriefSection';

interface BasicInfo {
  title: string;
  description: string;
  budget: string;
  currency: 'USD' | 'NGN';
  start_date: string;
  end_date: string;
  category: string;
}

interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  category: 'brand_asset' | 'reference' | 'campaign_visual' | 'video_brief';
  size: number;
}

interface SocialLinksData {
  website?: string;
  socialProfiles: Array<{
    platform: string;
    url: string;
    description?: string;
  }>;
  engagementPosts: string[];
  hashtags: string[];
  mentionRequirements: string[];
}

interface CampaignBriefData {
  mainBrief: string;
  objectives: string[];
  deliverables: Array<{
    id: string;
    type: 'post' | 'story' | 'reel' | 'video' | 'review' | 'unboxing' | 'tutorial';
    quantity: number;
    specifications: string;
    deadline?: string;
  }>;
  contentGuidelines: string;
  brandVoice: string;
  dos: string[];
  donts: string[];
  successMetrics: string[];
}

interface TargetDemographics {
  age_ranges: string[];
  locations: string[];
  interests: string[];
  follower_count_min: number;
  engagement_rate_min: number;
  languages: string[];
}

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Campaign title, description, and budget' },
  { id: 'media', title: 'Media Assets', description: 'Upload brand assets and campaign materials' },
  { id: 'links', title: 'Social Links', description: 'Social media profiles and requirements' },
  { id: 'brief', title: 'Campaign Brief', description: 'Detailed requirements and deliverables' },
  { id: 'targeting', title: 'Target Audience', description: 'Define your target demographics' },
  { id: 'review', title: 'Review & Submit', description: 'Review all details before submission' }
];

export const EnhancedCampaignCreation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<BrandWallet | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Form Data
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: '',
    description: '',
    budget: '',
    currency: 'USD',
    start_date: '',
    end_date: '',
    category: 'brand_awareness'
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  
  const [socialLinks, setSocialLinks] = useState<SocialLinksData>({
    socialProfiles: [],
    engagementPosts: [],
    hashtags: [],
    mentionRequirements: []
  });

  const [briefData, setBriefData] = useState<CampaignBriefData>({
    mainBrief: '',
    objectives: [],
    deliverables: [],
    contentGuidelines: '',
    brandVoice: '',
    dos: [],
    donts: [],
    successMetrics: []
  });

  const [targetDemographics, setTargetDemographics] = useState<TargetDemographics>({
    age_ranges: [],
    locations: [],
    interests: [],
    follower_count_min: 0,
    engagement_rate_min: 0,
    languages: []
  });

  useEffect(() => {
    if (user) {
      loadWallet();
      loadDraft();
    }
  }, [user]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep > 0) {
        saveDraft(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentStep, basicInfo, mediaAssets, socialLinks, briefData, targetDemographics]);

  const loadWallet = async () => {
    if (!user) return;
    const walletData = await brandWalletService.getWallet(user.id);
    setWallet(walletData);
  };

  const loadDraft = async () => {
    if (!user) return;
    
    const savedDraft = localStorage.getItem(`campaign_draft_${user.id}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setBasicInfo(draft.basicInfo || basicInfo);
        setMediaAssets(draft.mediaAssets || []);
        setSocialLinks(draft.socialLinks || socialLinks);
        setBriefData(draft.briefData || briefData);
        setTargetDemographics(draft.targetDemographics || targetDemographics);
        setIsDraft(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  };

  const saveDraft = async (silent = false) => {
    if (!user) return;

    const draft = {
      basicInfo,
      mediaAssets,
      socialLinks,
      briefData,
      targetDemographics,
      lastSaved: new Date().toISOString()
    };

    localStorage.setItem(`campaign_draft_${user.id}`, JSON.stringify(draft));
    
    if (!silent) {
      toast.success('Draft saved');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        if (!basicInfo.title.trim()) {
          toast.error('Campaign title is required');
          return false;
        }
        if (!basicInfo.budget || parseFloat(basicInfo.budget) <= 0) {
          toast.error('Valid budget is required');
          return false;
        }
        return true;
      case 1: // Media Assets
        return true; // Optional
      case 2: // Social Links
        return true; // Optional
      case 3: // Campaign Brief
        if (!briefData.mainBrief.trim()) {
          toast.error('Campaign brief is required');
          return false;
        }
        if (briefData.deliverables.length === 0) {
          toast.error('At least one deliverable is required');
          return false;
        }
        return true;
      case 4: // Target Demographics
        return true; // Optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
      saveDraft(true);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const submitCampaign = async (status: 'draft' | 'active') => {
    if (!user || !wallet) return;

    setLoading(true);
    try {
      const budgetAmount = parseFloat(basicInfo.budget);
      
      if (status === 'active' && wallet.balance < budgetAmount) {
        toast.error(`Insufficient wallet balance. You need $${budgetAmount} but only have $${wallet.balance}`);
        return;
      }

      // Create campaign data
      const campaignData = {
        brand_id: user.id,
        title: basicInfo.title,
        description: basicInfo.description,
        budget: budgetAmount,
        status,
        start_date: basicInfo.start_date || null,
        end_date: basicInfo.end_date || null,
        media_assets: JSON.parse(JSON.stringify(mediaAssets)),
        social_links: JSON.parse(JSON.stringify(socialLinks)),
        campaign_brief: briefData.mainBrief,
        target_demographics: JSON.parse(JSON.stringify(targetDemographics)),
        deliverable_specifications: JSON.parse(JSON.stringify({
          deliverables: briefData.deliverables,
          contentGuidelines: briefData.contentGuidelines,
          brandVoice: briefData.brandVoice
        })),
        hashtags: socialLinks.hashtags,
        admin_approval_status: 'pending' as const,
        payment_status: status === 'active' ? 'paid' as const : 'unpaid' as const
      };

      const { data: campaign, error: campaignError } = await supabase
        .from('brand_campaigns')
        .insert(campaignData)
        .select('id')
        .single();

      if (campaignError) throw campaignError;

      // Process wallet transaction if active campaign
      if (status === 'active') {
        const transactionId = await brandWalletService.processWalletTransaction(
          user.id,
          'campaign_charge',
          budgetAmount,
          `Campaign creation: ${basicInfo.title}`,
          undefined,
          campaign.id
        );

        if (!transactionId) {
          throw new Error('Failed to process wallet transaction');
        }

        await supabase
          .from('brand_campaigns')
          .update({ 
            wallet_transaction_id: transactionId,
            funded_amount: budgetAmount
          })
          .eq('id', campaign.id);
      }

      // Clear draft
      localStorage.removeItem(`campaign_draft_${user.id}`);

      toast.success(
        status === 'active' 
          ? 'Campaign created and submitted for approval!' 
          : 'Campaign saved as draft'
      );
      
      navigate('/brand-dashboard');
    } catch (error: any) {
      console.error('Campaign submission error:', error);
      toast.error(error.message || 'Failed to submit campaign');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/brand-dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Create Enhanced Campaign</h1>
            <p className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
          {isDraft && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Draft loaded</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`text-xs ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                    placeholder="Enter a compelling campaign title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                    placeholder="Brief overview of your campaign"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={basicInfo.currency}
                      onValueChange={(value: 'USD' | 'NGN') => 
                        setBasicInfo({ ...basicInfo, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="10"
                      value={basicInfo.budget}
                      onChange={(e) => setBasicInfo({ ...basicInfo, budget: e.target.value })}
                      placeholder="Enter budget amount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={basicInfo.category}
                      onValueChange={(value) => setBasicInfo({ ...basicInfo, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                        <SelectItem value="product_launch">Product Launch</SelectItem>
                        <SelectItem value="event_promotion">Event Promotion</SelectItem>
                        <SelectItem value="user_generated_content">User Generated Content</SelectItem>
                        <SelectItem value="influencer_collaboration">Influencer Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={basicInfo.start_date}
                      onChange={(e) => setBasicInfo({ ...basicInfo, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={basicInfo.end_date}
                      onChange={(e) => setBasicInfo({ ...basicInfo, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <MediaUploadSection
              mediaAssets={mediaAssets}
              onMediaAssetsChange={setMediaAssets}
            />
          )}

          {currentStep === 2 && (
            <SocialLinksSection
              socialLinks={socialLinks}
              onSocialLinksChange={setSocialLinks}
            />
          )}

          {currentStep === 3 && (
            <CampaignBriefSection
              briefData={briefData}
              onBriefDataChange={setBriefData}
            />
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="follower_min">Minimum Followers</Label>
                    <Input
                      id="follower_min"
                      type="number"
                      min="0"
                      value={targetDemographics.follower_count_min}
                      onChange={(e) => setTargetDemographics({
                        ...targetDemographics,
                        follower_count_min: parseInt(e.target.value) || 0
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="engagement_min">Minimum Engagement Rate (%)</Label>
                    <Input
                      id="engagement_min"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={targetDemographics.engagement_rate_min}
                      onChange={(e) => setTargetDemographics({
                        ...targetDemographics,
                        engagement_rate_min: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="age_ranges">Age Ranges (comma-separated)</Label>
                  <Input
                    id="age_ranges"
                    value={targetDemographics.age_ranges.join(', ')}
                    onChange={(e) => setTargetDemographics({
                      ...targetDemographics,
                      age_ranges: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="18-24, 25-34, 35-44"
                  />
                </div>

                <div>
                  <Label htmlFor="locations">Target Locations (comma-separated)</Label>
                  <Input
                    id="locations"
                    value={targetDemographics.locations.join(', ')}
                    onChange={(e) => setTargetDemographics({
                      ...targetDemographics,
                      locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="United States, Canada, United Kingdom"
                  />
                </div>

                <div>
                  <Label htmlFor="interests">Interests/Niches (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={targetDemographics.interests.join(', ')}
                    onChange={(e) => setTargetDemographics({
                      ...targetDemographics,
                      interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Fashion, Technology, Travel, Fitness"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Review & Submit Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Basic Information</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Title:</strong> {basicInfo.title}</p>
                      <p><strong>Budget:</strong> {basicInfo.currency} {basicInfo.budget}</p>
                      <p><strong>Category:</strong> {basicInfo.category}</p>
                      {basicInfo.start_date && <p><strong>Start:</strong> {basicInfo.start_date}</p>}
                      {basicInfo.end_date && <p><strong>End:</strong> {basicInfo.end_date}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Assets & Content</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Media Assets:</strong> {mediaAssets.length} files</p>
                      <p><strong>Social Profiles:</strong> {socialLinks.socialProfiles.length}</p>
                      <p><strong>Hashtags:</strong> {socialLinks.hashtags.length}</p>
                      <p><strong>Deliverables:</strong> {briefData.deliverables.length}</p>
                    </div>
                  </div>
                </div>

                {briefData.mainBrief && (
                  <div>
                    <h3 className="font-medium mb-2">Campaign Brief</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {briefData.mainBrief.substring(0, 200)}...
                    </p>
                  </div>
                )}

                {wallet && basicInfo.budget && (
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">Payment Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Campaign Budget:</span>
                        <span>{basicInfo.currency} {basicInfo.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Wallet Balance:</span>
                        <span className={wallet.balance < parseFloat(basicInfo.budget) ? 'text-destructive' : 'text-green-600'}>
                          ${wallet.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => saveDraft()}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep} disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} disabled={loading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => submitCampaign('draft')}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={() => submitCampaign('active')}
                  disabled={loading || (wallet && parseFloat(basicInfo.budget) > wallet.balance)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Campaign'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};