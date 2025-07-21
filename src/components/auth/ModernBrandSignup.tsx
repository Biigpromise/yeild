import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Mail, Lock, Globe, Users, Target, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface BrandSignupData {
  email: string;
  password: string;
  companyName: string;
  website: string;
  companySize: string;
  industry: string;
  taskTypes: string[];
  budget: string;
  goals: string;
  agreeTerms: boolean;
}

interface ModernBrandSignupProps {
  onBack: () => void;
  onSwitchToSignin?: () => void;
}

const ModernBrandSignup: React.FC<ModernBrandSignupProps> = ({ onBack, onSwitchToSignin }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showExistingUserMessage, setShowExistingUserMessage] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [formData, setFormData] = useState<BrandSignupData>({
    email: '',
    password: '',
    companyName: '',
    website: '',
    companySize: '',
    industry: '',
    taskTypes: [],
    budget: '',
    goals: '',
    agreeTerms: false
  });

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof BrandSignupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email' || field === 'password') {
      setShowExistingUserMessage(false);
    }
  };

  const handleTaskTypeChange = (taskType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      taskTypes: checked 
        ? [...prev.taskTypes, taskType]
        : prev.taskTypes.filter(type => type !== taskType)
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.companyName) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          return false;
        }
        break;
      case 2:
        if (!formData.companySize || !formData.industry) {
          toast.error("Please complete your company information");
          return false;
        }
        break;
      case 3:
        if (formData.taskTypes.length === 0 || !formData.budget) {
          toast.error("Please select your campaign preferences");
          return false;
        }
        break;
      case 4:
        if (!formData.goals || !formData.agreeTerms) {
          toast.error("Please complete all fields and agree to terms");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleExistingUserSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password to sign in");
      return;
    }

    setIsSigningIn(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Successfully signed in!");
        navigate('/brand-dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error("An error occurred during sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/brand-dashboard`;
      
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.companyName,
        'brand',
        {
          brand_application_data: {
            companyName: formData.companyName,
            website: formData.website,
            companySize: formData.companySize,
            industry: formData.industry,
            taskTypes: formData.taskTypes,
            budget: formData.budget,
            goals: formData.goals
          }
        },
        redirectUrl
      );
      
      if (error) {
        console.error('Signup error:', error);
        
        // Check for existing user errors
        if (error.message.includes('User already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('already been registered') ||
            error.code === 'user_already_exists') {
          setShowExistingUserMessage(true);
          setStep(1);
        } else {
          toast.error(error.message || "Failed to create account. Please try again.");
        }
      } else {
        toast.success("Brand application submitted successfully! Please check your email to verify your account.");
      }
    } catch (error: any) {
      console.error('Brand signup error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Account Setup", icon: Building2 },
    { id: 2, title: "Company Info", icon: Globe },
    { id: 3, title: "Campaign Goals", icon: Target },
    { id: 4, title: "Review & Submit", icon: CheckCircle }
  ];

  const taskTypeOptions = [
    'Social Media Engagement',
    'Content Creation',
    'Product Reviews',
    'Survey Participation',
    'App Downloads',
    'Video Watching',
    'Article Reading',
    'Newsletter Signup'
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Brand Account</h2>
              <p className="text-gray-400">Join YIELD and connect with our engaged community</p>
            </div>

            {showExistingUserMessage && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-blue-400 font-medium mb-2">Account Already Exists</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      An account with this email already exists. You can sign in with your existing credentials below.
                    </p>
                    <Button
                      onClick={handleExistingUserSignIn}
                      disabled={isSigningIn}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    >
                      {isSigningIn ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </div>
                      ) : (
                        'Sign In to Existing Account'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Company Name *</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@company.com"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a secure password (8+ characters)"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {!showExistingUserMessage && (
                <div className="text-center pt-4">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <button 
                      onClick={onSwitchToSignin}
                      className="text-yeild-yellow hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}

              {showExistingUserMessage && (
                <div className="text-center pt-4">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => {
                        setShowExistingUserMessage(false);
                        setFormData(prev => ({ ...prev, email: '', password: '' }));
                      }}
                      className="text-yeild-yellow hover:underline"
                    >
                      Try with different email
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Company Details</h2>
              <p className="text-gray-400">Tell us more about your business</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Website (Optional)</label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Company Size *</label>
                <Select onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Industry *</label>
                <Select onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Campaign Preferences</h2>
              <p className="text-gray-400">What type of campaigns do you want to create?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-4">Task Types (Select all that apply) *</label>
                <div className="grid grid-cols-2 gap-3">
                  {taskTypeOptions.map((taskType) => (
                    <div key={taskType} className="flex items-center space-x-2">
                      <Checkbox
                        id={taskType}
                        checked={formData.taskTypes.includes(taskType)}
                        onCheckedChange={(checked) => handleTaskTypeChange(taskType, checked as boolean)}
                      />
                      <label htmlFor={taskType} className="text-sm text-white">{taskType}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Monthly Marketing Budget *</label>
                <Select onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$500 - $2,000/month">$500 - $2,000/month</SelectItem>
                    <SelectItem value="$2,000 - $5,000/month">$2,000 - $5,000/month</SelectItem>
                    <SelectItem value="$5,000 - $10,000/month">$5,000 - $10,000/month</SelectItem>
                    <SelectItem value="$10,000 - $25,000/month">$10,000 - $25,000/month</SelectItem>
                    <SelectItem value="$25,000+/month">$25,000+/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
              <p className="text-gray-400">Complete your brand application</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Marketing Goals *</label>
                <Textarea
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  placeholder="Describe your marketing objectives and what success looks like for your brand..."
                  className="bg-gray-900 border-gray-700 text-white min-h-[120px]"
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the Terms of Service and Privacy Policy, and consent to receive communications about my brand application *
                </label>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-2 text-yeild-yellow">What happens next?</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Your application will be reviewed within 24-48 hours</li>
                  <li>• Once approved, you'll get access to the Brand Dashboard</li>
                  <li>• You can start creating campaigns and tasks immediately</li>
                  <li>• Our team will help you optimize your first campaign</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button 
          onClick={onBack} 
          className="text-white hover:text-yeild-yellow transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center">
          <span className="text-yeild-yellow text-2xl font-bold">YIELD</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {steps.map((stepInfo, index) => {
              const StepIcon = stepInfo.icon;
              return (
                <div key={stepInfo.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step >= stepInfo.id ? 'bg-yeild-yellow text-black' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-400">{stepInfo.title}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yeild-yellow h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
            {step > 1 && !showExistingUserMessage ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
                disabled={isLoading}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 4 && !showExistingUserMessage ? (
              <Button
                onClick={handleNext}
                className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 px-8"
              >
                Continue
              </Button>
            ) : step === 4 && !showExistingUserMessage ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 px-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBrandSignup;
