
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

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/90 backdrop-blur-sm border border-border shadow-xl hover:shadow-glow-yellow transition-all duration-500">
        <CardHeader className="text-center pb-2 space-y-6">
          <div className="flex justify-center mb-4">
            <div className="text-4xl font-bold text-primary glow-text animate-pulse-subtle">YIELD</div>
          </div>
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="mb-6 bg-muted/30 h-3 rounded-full overflow-hidden"
          />
          <div className="flex justify-center space-x-3 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    index + 1 <= currentStep 
                      ? 'bg-primary border-primary text-primary-foreground shadow-glow-yellow' 
                      : index + 1 === currentStep + 1
                      ? 'bg-primary/20 border-primary text-primary animate-pulse'
                      : 'bg-muted/20 border-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {index + 1 < currentStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardHeader>
        
        <CardContent className="px-6 sm:px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="min-h-[400px] flex flex-col"
            >
              <div className="flex-1">
                {renderStepContent()}
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="order-2 sm:order-1 w-full sm:w-auto border-border hover:bg-muted/50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2 order-1 sm:order-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            
            <Button
              onClick={handleNext}
              className="order-3 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-yellow hover:shadow-glow-yellow-lg transition-all"
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
