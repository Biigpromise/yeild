
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Globe, Users, Target, DollarSign, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BrandSignup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    website: '',
    companySize: '',
    industry: '',
    taskTypes: [] as string[],
    budget: '',
    goals: ''
  });

  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/brand-dashboard');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskTypeChange = (taskType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      taskTypes: checked 
        ? [...prev.taskTypes, taskType]
        : prev.taskTypes.filter(type => type !== taskType)
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error("Please fill in your email and password");
        return;
      }
    } else if (step === 2) {
      if (!formData.companyName || !formData.companySize || !formData.industry) {
        toast.error("Please fill in all company details");
        return;
      }
    } else if (step === 3) {
      if (formData.taskTypes.length === 0 || !formData.budget) {
        toast.error("Please select task types and budget");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.goals) {
      toast.error("Please describe your marketing goals");
      return;
    }

    setIsLoading(true);
    
    try {
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
        }
      );
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Brand application submitted successfully!");
        navigate('/brand-dashboard');
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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

  const companySize = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ];

  const industries = [
    'Technology',
    'E-commerce',
    'Healthcare',
    'Finance',
    'Education',
    'Entertainment',
    'Food & Beverage',
    'Fashion',
    'Travel',
    'Real Estate',
    'Automotive',
    'Other'
  ];

  const budgetRanges = [
    '$500 - $2,000/month',
    '$2,000 - $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000 - $25,000/month',
    '$25,000+/month'
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button onClick={handleBack} className="text-white text-lg flex items-center gap-2 hover:text-yeild-yellow transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center">
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-10 h-10 mx-auto object-contain"
          />
        </div>
        <div className="w-16"></div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= num ? 'bg-yeild-yellow text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                {num}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yeild-yellow h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Building2 className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Create Brand Account</h1>
                  <p className="text-gray-400">Let's start with your account credentials</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Globe className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Company Details</h1>
                  <p className="text-gray-400">Tell us about your business</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input
                      placeholder="Your Company Name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                    <Input
                      placeholder="https://yourcompany.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size</label>
                    <Select onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySize.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Select onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Target className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Campaign Preferences</h1>
                  <p className="text-gray-400">What type of tasks do you want to create?</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-4">Task Types (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {taskTypeOptions.map((taskType) => (
                        <div key={taskType} className="flex items-center space-x-2">
                          <Checkbox
                            id={taskType}
                            checked={formData.taskTypes.includes(taskType)}
                            onCheckedChange={(checked) => handleTaskTypeChange(taskType, checked as boolean)}
                          />
                          <label htmlFor={taskType} className="text-sm">{taskType}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Marketing Budget</label>
                    <Select onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((budget) => (
                          <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Lightbulb className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Marketing Goals</h1>
                  <p className="text-gray-400">What do you want to achieve with YEILD?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your marketing objectives and what success looks like for your brand
                  </label>
                  <Textarea
                    placeholder="e.g., Increase brand awareness, drive app downloads, gather product feedback, boost social media engagement..."
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white min-h-[120px]"
                  />
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-lg font-semibold mb-2 text-yeild-yellow">What happens next?</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Your application will be reviewed within 24-48 hours</li>
                    <li>• Once approved, you'll get access to the Brand Dashboard</li>
                    <li>• You can start creating tasks and campaigns immediately</li>
                    <li>• Our team will help you optimize your first campaign</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold"
                >
                  {isLoading ? "Submitting Application..." : "Submit Application"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BrandSignup;
