import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, Lock, User, CheckCircle, Building2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { InputValidator } from '@/services/validation/inputValidator';

type StepType = 'userType' | 'email' | 'password' | 'name' | 'complete';

interface FormData {
  email: string;
  password: string;
  name: string;
  userType: 'user' | 'brand' | '';
}

const ProgressiveAuthFlow = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('userType');
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    userType: ''
  });

  const { signIn, signUp, signInWithProvider, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const modeParam = searchParams.get('mode');
    
    if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
      setCurrentStep('email');
    }
    
    if (modeParam === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'brand') {
        navigate('/brand-dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, loading, navigate]);

  const getStepProgress = () => {
    const steps = isLogin ? ['userType', 'email', 'password'] : ['userType', 'email', 'password', 'name'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const handleUserTypeSelect = (type: 'user' | 'brand') => {
    setFormData(prev => ({ ...prev, userType: type }));
    setCurrentStep('email');
  };

  const handleNext = async () => {
    if (currentStep === 'email') {
      if (!InputValidator.email(formData.email)) return;
      setCurrentStep('password');
    } else if (currentStep === 'password') {
      if (!InputValidator.password(formData.password)) return;
      if (isLogin) {
        await handleSubmit();
      } else {
        setCurrentStep('name');
      }
    } else if (currentStep === 'name') {
      if (!InputValidator.required(formData.name, 'Name')) return;
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      setCurrentStep('userType');
    } else if (currentStep === 'password') {
      setCurrentStep('email');
    } else if (currentStep === 'name') {
      setCurrentStep('password');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          // Navigation will be handled by useEffect when user state changes
        }
      } else {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.userType,
          {},
          redirectUrl
        );
        
        if (error) {
          toast.error(error.message);
        } else {
          setCurrentStep('complete');
          toast.success("Account created! Please check your email to verify your account.");
          
          // Navigate to appropriate onboarding after a delay
          setTimeout(() => {
            if (formData.userType === 'brand') {
              navigate('/brand-onboarding');
            } else {
              navigate('/onboarding');
            }
          }, 2000);
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google', formData.userType);
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
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

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
      {/* Header with progress */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={currentStep === 'userType' ? () => navigate('/') : handleBack}
            variant="ghost"
            className="p-2 text-white hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex-1 mx-4">
            <Progress value={getStepProgress()} className="h-2" />
          </div>
          
          <div className="text-sm text-gray-400">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* User Type Selection */}
            {currentStep === 'userType' && (
              <motion.div
                key="userType"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <img 
                    src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
                    alt="YEILD Logo" 
                    className="w-16 h-16 mx-auto mb-6 object-contain"
                  />
                  <h1 className="text-3xl font-bold mb-2">Welcome to YEILD</h1>
                  <p className="text-gray-400 text-lg">
                    {isLogin ? 'Sign in to your account' : 'Choose your account type'}
                  </p>
                </div>

                {!isLogin && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => handleUserTypeSelect('user')}
                      variant="outline"
                      className="w-full p-6 h-auto text-left border-gray-600 hover:border-yeild-yellow hover:bg-yeild-yellow/10 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yeild-yellow/20 rounded-full group-hover:bg-yeild-yellow/30">
                          <Users className="w-6 h-6 text-yeild-yellow" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">I'm a User</h3>
                          <p className="text-gray-400 text-sm">Complete tasks, earn rewards, and build your reputation</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yeild-yellow ml-auto" />
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleUserTypeSelect('brand')}
                      variant="outline"
                      className="w-full p-6 h-auto text-left border-gray-600 hover:border-yeild-yellow hover:bg-yeild-yellow/10 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yeild-yellow/20 rounded-full group-hover:bg-yeild-yellow/30">
                          <Building2 className="w-6 h-6 text-yeild-yellow" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">I'm a Brand</h3>
                          <p className="text-gray-400 text-sm">Create campaigns and connect with your audience</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yeild-yellow ml-auto" />
                      </div>
                    </Button>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={handleGoogleAuth}
                    variant="outline"
                    className="w-full py-3 border-gray-600 text-white hover:bg-gray-800 rounded-lg flex items-center justify-center gap-3"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-yeild-yellow hover:text-yeild-yellow/80 font-medium"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Email Step */}
            {currentStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your email?</h2>
                  <p className="text-gray-400">We'll use this to send you updates and notifications</p>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-3 text-lg font-semibold rounded-lg"
                  disabled={!formData.email}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Password Step */}
            {currentStep === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {isLogin ? 'Enter your password' : 'Create a secure password'}
                  </h2>
                  <p className="text-gray-400">
                    {isLogin ? 'Welcome back!' : 'Must be at least 8 characters with uppercase, lowercase, and number'}
                  </p>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-black border-gray-600 text-white pl-10 pr-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-3 text-lg font-semibold rounded-lg"
                  disabled={!formData.password || isLoading}
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Continue')}
                </Button>
              </motion.div>
            )}

            {/* Name Step */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
                  <p className="text-gray-400">This will be displayed on your profile</p>
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-3 text-lg font-semibold rounded-lg"
                  disabled={!formData.name || isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </motion.div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="p-4 bg-green-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account created!</h2>
                  <p className="text-gray-400">
                    Please check your email to verify your account. You'll be redirected to your dashboard shortly.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAuthFlow;