import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { CampaignBasicDetails } from '@/components/campaign/CampaignBasicDetails';
import { CampaignBriefSection } from '@/components/campaign/CampaignBriefSection';
import { MediaUploadSection } from '@/components/campaign/MediaUploadSection';
import { SocialLinksSection } from '@/components/campaign/SocialLinksSection';
import { CampaignTargetingSection } from '@/components/campaign/CampaignTargetingSection';
import { CampaignBudgetSection } from '@/components/campaign/CampaignBudgetSection';
import { CampaignReviewSection } from '@/components/campaign/CampaignReviewSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MediaAsset } from '@/components/campaign/MediaUploadSection';
import type { SocialLinksData } from '@/components/campaign/SocialLinksSection';
import type { CampaignBriefData } from '@/components/campaign/CampaignBriefSection';

interface CampaignFormData {
  // Basic Details
  title: string;
  description: string;
  category: string;
  logo_url?: string;
  
  // Brief
  brief: CampaignBriefData;
  
  // Media
  media_assets: MediaAsset[];
  
  // Social Links
  social_links: SocialLinksData;
  
  // Targeting
  target_demographics: {
    ageRange: string;
    gender: string;
    location: string[];
    interests: string[];
    languages: string[];
  };
  
  // Budget & Timeline
  budget: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  funding_source: 'wallet' | 'payment';
}

const STEPS = [
  { id: 1, name: 'Basic Details', description: 'Campaign name and description' },
  { id: 2, name: 'Campaign Brief', description: 'Detailed campaign requirements' },
  { id: 3, name: 'Media Assets', description: 'Upload brand assets and materials' },
  { id: 4, name: 'Social Links', description: 'Social media and engagement details' },
  { id: 5, name: 'Targeting', description: 'Define your target audience' },
  { id: 6, name: 'Budget & Timeline', description: 'Set budget and campaign dates' },
  { id: 7, name: 'Review & Submit', description: 'Review and submit your campaign' }
];

export const RichCampaignCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    category: '',
    brief: {
      mainBrief: '',
      objectives: [],
      deliverables: [],
      contentGuidelines: '',
      brandVoice: '',
      dos: [],
      donts: [],
      successMetrics: []
    },
    media_assets: [],
    social_links: {
      website: '',
      socialProfiles: [],
      engagementPosts: [],
      hashtags: [],
      mentionRequirements: []
    },
    target_demographics: {
      ageRange: '',
      gender: '',
      location: [],
      interests: [],
      languages: []
    },
    budget: 0,
    currency: 'NGN',
    funding_source: 'wallet'
  });

  const updateFormData = (section: keyof CampaignFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.brief.mainBrief.trim() && formData.brief.objectives.length > 0;
      case 3:
        return true; // Media is optional
      case 4:
        return true; // Social links are optional
      case 5:
        return formData.target_demographics.ageRange && formData.target_demographics.gender;
      case 6:
        return formData.budget > 0;
      default:
        return true;
    }
  };

  const submitCampaign = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const campaignData = {
        brand_id: user.id,
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        logo_url: formData.logo_url,
        status: 'draft',
        admin_approval_status: 'pending',
        payment_status: 'unpaid',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        target_audience: JSON.parse(JSON.stringify(formData.target_demographics)),
        requirements: JSON.parse(JSON.stringify(formData.brief)),
        media_assets: JSON.parse(JSON.stringify(formData.media_assets)),
        social_links: JSON.parse(JSON.stringify(formData.social_links)),
        campaign_brief: formData.brief.mainBrief,
        deliverable_specifications: JSON.parse(JSON.stringify({
          deliverables: formData.brief.deliverables,
          contentGuidelines: formData.brief.contentGuidelines,
          brandVoice: formData.brief.brandVoice
        })),
        tracking_parameters: JSON.parse(JSON.stringify({
          hashtags: formData.social_links.hashtags,
          mentionRequirements: formData.social_links.mentionRequirements
        }))
      };

      const { error } = await supabase
        .from('brand_campaigns')
        .insert(campaignData);
      
      if (error) throw error;
      
      toast.success('Campaign created successfully!');
      navigate('/brand-dashboard/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignBasicDetails
            data={{
              title: formData.title,
              description: formData.description,
              category: formData.category,
              logo_url: formData.logo_url
            }}
            onDataChange={(data) => {
              updateFormData('title', data.title);
              updateFormData('description', data.description);
              updateFormData('category', data.category);
              updateFormData('logo_url', data.logo_url);
            }}
          />
        );
      case 2:
        return (
          <CampaignBriefSection
            briefData={formData.brief}
            onBriefDataChange={(data) => updateFormData('brief', data)}
          />
        );
      case 3:
        return (
          <MediaUploadSection
            mediaAssets={formData.media_assets}
            onMediaAssetsChange={(assets) => updateFormData('media_assets', assets)}
          />
        );
      case 4:
        return (
          <SocialLinksSection
            socialLinks={formData.social_links}
            onSocialLinksChange={(data) => updateFormData('social_links', data)}
          />
        );
      case 5:
        return (
          <CampaignTargetingSection
            targetData={formData.target_demographics}
            onTargetDataChange={(data) => updateFormData('target_demographics', data)}
          />
        );
      case 6:
        return (
          <CampaignBudgetSection
            budgetData={{
              budget: formData.budget,
              currency: formData.currency,
              start_date: formData.start_date,
              end_date: formData.end_date,
              funding_source: formData.funding_source
            }}
            onBudgetDataChange={(data) => {
              updateFormData('budget', data.budget);
              updateFormData('currency', data.currency);
              updateFormData('start_date', data.start_date);
              updateFormData('end_date', data.end_date);
              updateFormData('funding_source', data.funding_source);
            }}
          />
        );
      case 7:
        return (
          <CampaignReviewSection
            formData={formData}
            onSubmit={submitCampaign}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/brand-dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{Math.round(progress)}% Complete</div>
              <Progress value={progress} className="w-32 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Step Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      step.id === currentStep
                        ? 'border-primary bg-primary/5'
                        : step.id < currentStep
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.id === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : step.id < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{step.name}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
                <p className="text-muted-foreground">{STEPS[currentStep - 1].description}</p>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateCurrentStep()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitCampaign}
                  disabled={loading || !validateCurrentStep()}
                >
                  {loading ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};