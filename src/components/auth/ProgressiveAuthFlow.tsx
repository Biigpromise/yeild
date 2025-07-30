import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { YieldLogo } from '@/components/ui/YieldLogo';

type StepType = 'email' | 'password' | 'name' | 'userType';

interface FormData {
  email: string;
  password: string;
  name: string;
  userType: 'user' | 'brand' | '';
}

const ProgressiveAuthFlow = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    userType: ''
  });

  const { signIn, signUp, user, loading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize based on URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const modeParam = searchParams.get('mode');
    
    if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
      // Start from email step when userType is pre-selected
      setCurrentStep('email');
      setIsLogin(true);
    } else if (modeParam === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'brand') {
        navigate('/brand-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 'email') {
      setCurrentStep('password');
    } else if (currentStep === 'password') {
      if (isLogin) {
        await handleSubmit();
      } else {
        setCurrentStep('name');
      }
    } else if (currentStep === 'name') {
      // If userType is already set (from URL params), skip to submission
      if (formData.userType) {
        await handleSubmit();
      } else {
        setCurrentStep('userType');
      }
    } else if (currentStep === 'userType') {
      await handleSubmit();
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        if (!formData.email || !formData.email.includes('@')) {
          toast.error('Enter a valid email');
          return false;
        }
        return true;
      case 'password':
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 'name':
        if (!formData.name.trim()) {
          toast.error('Enter your name');
          return false;
        }
        return true;
      case 'userType':
        if (!formData.userType) {
          toast.error('Select account type');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleBack = () => {
    if (currentStep === 'password') {
      setCurrentStep('email');
    } else if (currentStep === 'name') {
      setCurrentStep('password');
    } else if (currentStep === 'userType') {
      setCurrentStep('name');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error('Sign in failed');
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.userType,
          { email_confirm: false }
        );
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Email already exists', {
              action: {
                label: 'Sign In',
                onClick: () => {
                  setIsLogin(true);
                  setCurrentStep('password');
                }
              }
            });
          } else {
            toast.error('Sign up failed');
          }
        } else {
          toast.success('Account created!');
          setTimeout(() => {
            navigate(formData.userType === 'brand' ? '/brand-onboarding' : '/onboarding');
          }, 1000);
        }
      }
    } catch (error: any) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeSelect = (type: 'user' | 'brand') => {
    setFormData(prev => ({ ...prev, userType: type }));
    // Auto-submit after user type selection
    setTimeout(() => handleSubmit(), 100);
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter your email first');
      setCurrentStep('email');
      return;
    }
    
    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        toast.error('Failed to send reset email');
      } else {
        toast.success('Password reset email sent!');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTitle = () => {
    if (currentStep === 'email') return isLogin ? 'Sign in' : 'Sign up';
    if (currentStep === 'password') return isLogin ? 'Enter password' : 'Create password';
    if (currentStep === 'name') return 'What\'s your name?';
    if (currentStep === 'userType') return 'I want to...';
    return '';
  };

  const getPlaceholder = () => {
    if (currentStep === 'email') return 'Email';
    if (currentStep === 'password') return 'Password';
    if (currentStep === 'name') return 'Name';
    return '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center">
            <YieldLogo size={48} className="mx-auto mb-6" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Title */}
              <h1 className="text-2xl font-bold text-center text-foreground">
                {getTitle()}
              </h1>

              {/* Input Field */}
              {currentStep !== 'userType' && (
                <div className="relative">
                  <input
                    type={currentStep === 'email' ? 'email' : currentStep === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
                    placeholder={getPlaceholder()}
                    value={currentStep === 'email' ? formData.email : currentStep === 'password' ? formData.password : formData.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [currentStep]: e.target.value 
                    }))}
                    className="w-full h-14 px-4 text-lg bg-background border-2 border-border rounded-xl focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground transition-colors"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  />
                  
                  {currentStep === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              )}

              {/* User Type Selection */}
              {currentStep === 'userType' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleUserTypeSelect('user')}
                    className="w-full p-4 text-left border-2 border-border rounded-xl hover:border-primary transition-colors group"
                  >
                    <div className="font-medium text-foreground group-hover:text-primary">Complete tasks & earn</div>
                    <div className="text-sm text-muted-foreground">I'm a user</div>
                  </button>
                  
                  <button
                    onClick={() => handleUserTypeSelect('brand')}
                    className="w-full p-4 text-left border-2 border-border rounded-xl hover:border-primary transition-colors group"
                  >
                    <div className="font-medium text-foreground group-hover:text-primary">Create campaigns</div>
                    <div className="text-sm text-muted-foreground">I'm a brand</div>
                  </button>
                </div>
              )}

              {/* Next Button */}
              {currentStep !== 'userType' && (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                  ) : (
                    currentStep === 'password' && isLogin ? 'Sign in' : 
                    currentStep === 'name' || (currentStep === 'password' && !isLogin) ? 'Continue' : 
                    'Next'
                  )}
                </Button>
              )}

              {/* Forgot Password Link */}
              {currentStep === 'password' && isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-warning hover:text-warning/80 underline transition-colors font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Toggle login/signup */}
              {currentStep === 'email' && (
                <div className="text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAuthFlow;