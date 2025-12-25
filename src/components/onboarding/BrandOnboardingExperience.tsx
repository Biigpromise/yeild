
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Building2, Globe, Users, Target, DollarSign, CheckCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandOnboardingExperienceProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to YIELD",
    subtitle: "Let's get your brand set up for success",
    icon: Building2,
    color: "text-yeild-yellow"
  },
  {
    id: 2,
    title: "Company Information",
    subtitle: "Tell us about your business",
    icon: Globe,
    color: "text-yeild-yellow"
  },
  {
    id: 3,
    title: "Campaign Preferences",
    subtitle: "What type of campaigns do you want to run?",
    icon: Target,
    color: "text-yeild-yellow"
  },
  {
    id: 4,
    title: "Budget & Goals",
    subtitle: "Set your campaign parameters",
    icon: DollarSign,
    color: "text-yeild-yellow"
  },
  {
    id: 5,
    title: "All Set!",
    subtitle: "Your brand account is ready",
    icon: CheckCircle,
    color: "text-yeild-yellow"
  }
];

const BrandOnboardingExperience: React.FC<BrandOnboardingExperienceProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    description: '',
    taskTypes: [] as string[],
    budget: '',
    goals: ''
  });

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        onComplete();
      } catch (error) {
        console.error('Error completing brand onboarding:', error);
      }
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipAll = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      onComplete();
    } catch (error) {
      console.error('Error skipping brand onboarding:', error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTaskTypeChange = (taskType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      taskTypes: checked
        ? [...prev.taskTypes, taskType]
        : prev.taskTypes.filter(t => t !== taskType)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">Welcome to YIELD</h2>
              <p className="text-white/80">
                Join thousands of brands leveraging user-generated content to grow their business.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <Users className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium text-white">10,000+</p>
                <p className="text-xs text-white/60">Active Users</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <Target className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium text-white">95%</p>
                <p className="text-xs text-white/60">Task Success Rate</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <Building2 className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium text-white">500+</p>
                <p className="text-xs text-white/60">Partner Brands</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Company Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-white">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-yeild-yellow"
                />
              </div>
              
              <div>
                <Label htmlFor="website" className="text-white">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-yeild-yellow"
                />
              </div>
              
              <div>
                <Label htmlFor="industry" className="text-white">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-yeild-yellow">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="companySize" className="text-white">Company Size</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-yeild-yellow">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Campaign Preferences</h2>
            </div>
            
            <div>
              <Label className="text-base font-medium mb-4 block text-white">
                What type of campaigns do you want to run? (Select all that apply)
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Product Reviews',
                  'Social Media Posts',
                  'Video Testimonials',
                  'App Testing',
                  'Website Feedback',
                  'Content Creation',
                  'Survey Participation',
                  'Beta Testing'
                ].map((taskType) => (
                  <div key={taskType} className="flex items-center space-x-2">
                    <Checkbox
                      id={taskType}
                      checked={formData.taskTypes.includes(taskType)}
                      onCheckedChange={(checked) => handleTaskTypeChange(taskType, checked as boolean)}
                      className="border-white/20 data-[state=checked]:bg-yeild-yellow data-[state=checked]:border-yeild-yellow"
                    />
                    <Label htmlFor={taskType} className="text-sm text-white">{taskType}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Budget & Goals</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget" className="text-white">Monthly Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-yeild-yellow">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="under-1000">Under $1,000</SelectItem>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25000+">$25,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="goals" className="text-white">Campaign Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  placeholder="What do you hope to achieve with your campaigns?"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-yeild-yellow min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">All Set!</h2>
              <p className="text-white/80">
                Your brand account is ready. You can now start creating campaigns and connecting with users.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-sm text-white/80">
                <strong className="text-yeild-yellow">Next Steps:</strong> Explore the dashboard, create your first campaign, and start engaging with our community of users.
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
            <div className="text-3xl font-bold text-yeild-yellow">YIELD</div>
          </div>
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="mb-4 bg-white/10"
          />
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  index + 1 <= currentStep ? 'bg-yeild-yellow' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handlePrevious(e)}
                disabled={currentStep === 1}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSkipAll(e)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Skip All
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={(e) => handleNext(e)}
              className="bg-yeild-yellow hover:bg-yeild-yellow/90 text-black"
            >
              {currentStep === steps.length ? 'Complete Setup' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOnboardingExperience;
