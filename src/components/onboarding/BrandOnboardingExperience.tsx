import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Globe, Target, DollarSign, CheckCircle, ArrowRight, 
  AlertTriangle, Clock, Ban, Eye, Smartphone, ClipboardList, Share2,
  MapPin, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  PLATFORM_FEE_MIN, 
  PLATFORM_FEE_MAX,
  CAMPAIGN_CREATION_FEE_DIGITAL,
  CAMPAIGN_CREATION_FEE_FIELD,
  EXECUTION_MODES
} from '@/types/execution';

interface BrandOnboardingExperienceProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: "Platform Introduction", icon: Shield },
  { id: 2, title: "Execution Rules", icon: AlertTriangle },
  { id: 3, title: "Execution Mode", icon: Zap },
  { id: 4, title: "Brand Qualification", icon: Globe },
  { id: 5, title: "Goal Selection", icon: Target },
  { id: 6, title: "Financial Commitment", icon: DollarSign },
  { id: 7, title: "Complete", icon: CheckCircle }
];

const BRAND_CATEGORIES = [
  { value: 'startup', label: 'Startup' },
  { value: 'sme', label: 'SME (Small/Medium Enterprise)' },
  { value: 'digital_product', label: 'Digital Product' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'local_service', label: 'Local Service' },
  { value: 'utility', label: 'Utility / Infrastructure' }
];

const EXECUTION_GOALS = [
  { id: 'app_activation', label: 'App Activations', description: 'Get users to install and activate your app', icon: Smartphone, mode: 'digital' },
  { id: 'website_signup', label: 'Website Signups', description: 'Drive user registrations on your website', icon: Globe, mode: 'digital' },
  { id: 'social_placement', label: 'Social Content Placement', description: 'Get your content posted on social media', icon: Share2, mode: 'digital' },
  { id: 'survey_completion', label: 'Survey Completions', description: 'Collect user feedback and data', icon: ClipboardList, mode: 'digital' },
  { id: 'property_inspection', label: 'Property Inspections', description: 'Physical asset verification and documentation', icon: MapPin, mode: 'field' },
  { id: 'field_sales', label: 'Field Sales Support', description: 'On-ground sales and client meetings', icon: Target, mode: 'field' }
];

const FORBIDDEN_ACTIONS = [
  'Likes, follows, or subscribers',
  'Views or watch time',
  'Engagement or impressions',
  'Reach or exposure guarantees',
  'Viral or trending promises'
];

const BrandOnboardingExperience: React.FC<BrandOnboardingExperienceProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    country: '',
    category: '',
    selectedGoals: [] as string[],
    executionMode: '' as 'digital' | 'field' | '',
    // Acceptance checkboxes
    acceptedExecutionRules: false,
    acceptedVerificationDelays: false,
    acceptedNoDirectContact: false,
    acceptedYeildAuthority: false,
    acceptedPlatformFee: false
  });

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.acceptedExecutionRules && 
               formData.acceptedVerificationDelays && 
               formData.acceptedNoDirectContact && 
               formData.acceptedYeildAuthority;
      case 3:
        return formData.executionMode !== '';
      case 4:
        return formData.companyName.trim() !== '' && 
               formData.websiteUrl.trim() !== '' && 
               formData.country.trim() !== '' && 
               formData.category !== '';
      case 5:
        return formData.selectedGoals.length > 0;
      case 6:
        return formData.acceptedPlatformFee;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save brand qualification to database
      const { error } = await supabase
        .from('brand_qualification')
        .upsert({
          brand_id: user.id,
          company_name: formData.companyName,
          website_url: formData.websiteUrl,
          country: formData.country,
          category: formData.category,
          accepted_execution_rules: formData.acceptedExecutionRules,
          accepted_verification_delays: formData.acceptedVerificationDelays,
          accepted_no_direct_contact: formData.acceptedNoDirectContact,
          accepted_yeild_authority: formData.acceptedYeildAuthority,
          qualification_status: 'qualified',
          qualified_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Brand qualification complete!');
      onComplete();
    } catch (error) {
      console.error('Error saving brand qualification:', error);
      toast.error('Failed to complete qualification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(g => g !== goalId)
        : [...prev.selectedGoals, goalId]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-yeild-yellow" />
              </div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">Welcome to YEILD</h2>
              <p className="text-white/80 text-lg">Managed Human Execution Platform</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">YEILD is NOT:</h3>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-400" />
                  An engagement platform
                </li>
                <li className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-400" />
                  A social network
                </li>
                <li className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-400" />
                  A referral or attention farm
                </li>
              </ul>
            </div>

            <div className="bg-yeild-yellow/10 border border-yeild-yellow/30 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-yeild-yellow">YEILD exists to:</h3>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yeild-yellow" />
                  Manage human execution for brands
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yeild-yellow" />
                  Verify task completion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yeild-yellow" />
                  Deliver provable outcomes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yeild-yellow" />
                  Protect brand trust above growth
                </li>
              </ul>
            </div>

            <p className="text-center text-white/60 text-sm italic">
              "YEILD would rather be small than corrupt."
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Execution Rules</h2>
              <p className="text-white/60">You must accept these terms to proceed</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <Ban className="h-4 w-4" /> Forbidden Actions
              </h3>
              <ul className="text-white/70 text-sm space-y-1">
                {FORBIDDEN_ACTIONS.map((action, i) => (
                  <li key={i}>• {action}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="executionRules"
                  checked={formData.acceptedExecutionRules}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedExecutionRules: checked as boolean }))
                  }
                  className="mt-1 border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                />
                <Label htmlFor="executionRules" className="text-white/90 cursor-pointer">
                  I understand that all brand activity must occur through <strong>Execution Orders</strong>. 
                  Free-form tasks are forbidden.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="verificationDelays"
                  checked={formData.acceptedVerificationDelays}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedVerificationDelays: checked as boolean }))
                  }
                  className="mt-1 border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                />
                <Label htmlFor="verificationDelays" className="text-white/90 cursor-pointer flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-yeild-yellow shrink-0" />
                  I accept that verification takes <strong>24-72 hours</strong>. Instant approval is not available.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="noDirectContact"
                  checked={formData.acceptedNoDirectContact}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedNoDirectContact: checked as boolean }))
                  }
                  className="mt-1 border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                />
                <Label htmlFor="noDirectContact" className="text-white/90 cursor-pointer">
                  I understand that <strong>brands and operators never contact each other</strong>. 
                  All disputes are resolved internally by YEILD.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="yeildAuthority"
                  checked={formData.acceptedYeildAuthority}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedYeildAuthority: checked as boolean }))
                  }
                  className="mt-1 border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                />
                <Label htmlFor="yeildAuthority" className="text-white/90 cursor-pointer flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 text-yeild-yellow shrink-0" />
                  I accept that <strong>YEILD alone verifies executions</strong>. 
                  Brands cannot approve or reject proofs.
                </Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Choose Execution Mode</h2>
              <p className="text-white/60">Select how you want operators to execute for your brand</p>
            </div>

            <div className="grid gap-4">
              {EXECUTION_MODES.map(mode => (
                <div
                  key={mode.id}
                  onClick={() => setFormData(prev => ({ ...prev, executionMode: mode.id }))}
                  className={`p-6 rounded-lg border cursor-pointer transition-all ${
                    formData.executionMode === mode.id
                      ? 'bg-yeild-yellow/10 border-yeild-yellow'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      formData.executionMode === mode.id ? 'bg-yeild-yellow/20' : 'bg-white/10'
                    }`}>
                      {mode.id === 'digital' ? (
                        <Globe className={`h-6 w-6 ${formData.executionMode === mode.id ? 'text-yeild-yellow' : 'text-white/60'}`} />
                      ) : (
                        <MapPin className={`h-6 w-6 ${formData.executionMode === mode.id ? 'text-yeild-yellow' : 'text-white/60'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        formData.executionMode === mode.id ? 'text-yeild-yellow' : 'text-white'
                      }`}>{mode.name}</h3>
                      <p className="text-sm text-white/60 mt-1">{mode.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mode.useCases.slice(0, 3).map((useCase, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-white/5 rounded text-white/70">
                            {useCase}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-white/50">
                          Platform Fee: {mode.platformFeeMin}-{mode.platformFeeMax}%
                        </span>
                        <span className="text-xs text-white/50">
                          Creation Fee: ₦{mode.id === 'field' ? CAMPAIGN_CREATION_FEE_FIELD.toLocaleString() : CAMPAIGN_CREATION_FEE_DIGITAL.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-white/80">
                <strong className="text-blue-400">Tip:</strong> Start with Digital mode for online campaigns. 
                Field mode requires operators with Eagle rank or higher.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Brand Qualification</h2>
              <p className="text-white/60">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-white">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-yeild-yellow"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl" className="text-white">Product/Website URL *</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://yourproduct.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-yeild-yellow"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-white">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., Nigeria, United States, Kenya"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-yeild-yellow"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">Business Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-yeild-yellow">
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    {BRAND_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        // Filter goals based on selected execution mode
        const relevantGoals = formData.executionMode 
          ? EXECUTION_GOALS.filter(g => g.mode === formData.executionMode || !formData.executionMode)
          : EXECUTION_GOALS;

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Goal Selection</h2>
              <p className="text-white/60">What outcomes do you need? (Select all that apply)</p>
            </div>

            <div className="grid gap-3">
              {relevantGoals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.selectedGoals.includes(goal.id)
                      ? 'bg-yeild-yellow/10 border-yeild-yellow'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.selectedGoals.includes(goal.id) ? 'bg-yeild-yellow/20' : 'bg-white/10'
                    }`}>
                      <goal.icon className={`h-5 w-5 ${
                        formData.selectedGoals.includes(goal.id) ? 'text-yeild-yellow' : 'text-white/60'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${
                          formData.selectedGoals.includes(goal.id) ? 'text-yeild-yellow' : 'text-white'
                        }`}>{goal.label}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          goal.mode === 'digital' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {goal.mode === 'digital' ? 'Digital' : 'Field'}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{goal.description}</p>
                    </div>
                    <Checkbox
                      checked={formData.selectedGoals.includes(goal.id)}
                      className="border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/50 text-sm text-center">
              Note: Free-form goals are not allowed. All executions must use approved templates.
            </p>
          </div>
        );

      case 6:
        const selectedMode = EXECUTION_MODES.find(m => m.id === formData.executionMode);
        const feeMin = selectedMode?.platformFeeMin || PLATFORM_FEE_MIN;
        const feeMax = selectedMode?.platformFeeMax || PLATFORM_FEE_MAX;
        const creationFee = formData.executionMode === 'field' ? CAMPAIGN_CREATION_FEE_FIELD : CAMPAIGN_CREATION_FEE_DIGITAL;

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Financial Commitment</h2>
              <p className="text-white/60">YEILD prices execution, not attention</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Pricing Model</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Operator Receives</span>
                  <span className="text-white font-medium">{100 - feeMax}% - {100 - feeMin}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">YEILD Platform Fee</span>
                  <span className="text-yeild-yellow font-medium">{feeMin}% - {feeMax}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Campaign Creation Fee</span>
                  <span className="text-white font-medium">₦{creationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white font-semibold">Your Total Cost</span>
                  <span className="text-white font-semibold">Execution + Fee + ₦{creationFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-sm text-white/60 space-y-1 pt-2">
                <p>• <strong className="text-green-400">No success = No platform fee</strong></p>
                <p>• Minimum payout floors enforced</p>
                <p>• No bidding or negotiation</p>
                <p>• Brands pay only for verified executions</p>
              </div>
            </div>

            <div className="bg-yeild-yellow/10 border border-yeild-yellow/30 rounded-lg p-4">
              <h4 className="text-yeild-yellow font-medium mb-2">Payout Rules</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Operator payouts are delayed by default (7 days)</li>
                <li>• Delay increases with execution risk</li>
                <li>• Disputes pause payouts</li>
                <li>• Rejected executions are not paid</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Checkbox
                id="platformFee"
                checked={formData.acceptedPlatformFee}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, acceptedPlatformFee: checked as boolean }))
                }
                className="mt-1 border-white/30 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
              />
              <Label htmlFor="platformFee" className="text-white/90 cursor-pointer">
                I understand and accept the {feeMin}-{feeMax}% platform management fee, 
                the ₦{creationFee.toLocaleString()} campaign creation fee, and the payout rules described above.
              </Label>
            </div>
          </div>
        );

      case 7:
        const finalMode = EXECUTION_MODES.find(m => m.id === formData.executionMode);
        const finalFeeMin = finalMode?.platformFeeMin || PLATFORM_FEE_MIN;
        const finalFeeMax = finalMode?.platformFeeMax || PLATFORM_FEE_MAX;

        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">Qualification Complete</h2>
              <p className="text-white/80">
                Your brand account is qualified. You can now create Execution Orders.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left space-y-3">
              <h3 className="text-white font-semibold">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Company</span>
                  <span className="text-white">{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Category</span>
                  <span className="text-white capitalize">{formData.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Execution Mode</span>
                  <span className={`capitalize ${formData.executionMode === 'digital' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {formData.executionMode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Goals</span>
                  <span className="text-white">{formData.selectedGoals.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Platform Fee</span>
                  <span className="text-yeild-yellow">{finalFeeMin}-{finalFeeMax}%</span>
                </div>
              </div>
            </div>

            <div className="bg-yeild-yellow/10 border border-yeild-yellow/30 rounded-lg p-4">
              <p className="text-sm text-white/80">
                <strong className="text-yeild-yellow">Next Steps:</strong> Fund your wallet and 
                create your first Execution Order from the approved templates.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black border border-white/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-yeild-yellow">YEILD</div>
          </div>
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="mb-4 bg-white/10"
          />
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index + 1 <= currentStep ? 'bg-yeild-yellow' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
            >
              Previous
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-yeild-yellow hover:bg-yeild-yellow/90 text-black disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : currentStep === steps.length ? 'Complete Setup' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOnboardingExperience;
