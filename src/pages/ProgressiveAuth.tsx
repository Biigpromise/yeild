
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const ProgressiveAuth = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'user';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPreference, setUserPreference] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const { signIn, signUp, signInWithProvider, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (userType === 'brand') {
        navigate('/brand-signup');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, loading, navigate, userType]);

  const steps = isSignUp 
    ? ['welcome', 'method', 'email', 'password', 'name', 'preference']
    : ['method', 'email', 'password'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/user-type');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google', userType);
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSignUp && !formData.name) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.name, userType, {
          user_preference: userPreference
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created successfully! Please check your email to confirm.");
          if (userType === 'brand') {
            navigate('/brand-signup');
          } else {
            navigate('/onboarding');
          }
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          // Navigation will be handled by auth state change
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">
                Welcome to <span className="text-yeild-yellow">YEILD</span> 👋
              </h1>
              <p className="text-xl text-gray-300">
                Let's set up your account and get you earning.
              </p>
            </div>
            
            <Button 
              onClick={handleNext}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
            >
              Continue
            </Button>
          </motion.div>
        );

      case 'method':
        return (
          <motion.div 
            key="method"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {isSignUp ? 'Sign up' : 'Sign in'} as {userType === 'brand' ? 'Brand' : 'User'}
              </h1>
            </div>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 py-6 text-lg font-medium rounded-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            </Button>
            
            <div className="flex items-center justify-center space-x-4 text-gray-400">
              <div className="h-px bg-gray-600 flex-1"></div>
              <span>or</span>
              <div className="h-px bg-gray-600 flex-1"></div>
            </div>
            
            <Button 
              onClick={handleNext}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
            >
              {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
            </Button>

            <div className="text-center">
              <span className="text-gray-400">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-yeild-yellow hover:text-yeild-yellow/80 font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          </motion.div>
        );

      case 'email':
        return (
          <motion.div 
            key="email"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">What's your email?</h2>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border-gray-600 text-white pl-10 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
                autoFocus
              />
            </div>
            
            <Button 
              onClick={handleNext}
              disabled={!formData.email}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 'password':
        return (
          <motion.div 
            key="password"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">
                {isSignUp ? 'Create a password' : 'Enter your password'}
              </h2>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black border-gray-600 text-white pl-10 pr-12 py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
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

            {isSignUp && formData.password.length > 0 && formData.password.length < 6 && (
              <p className="text-red-400 text-sm">Password must be at least 6 characters</p>
            )}
            
            <Button 
              onClick={isSignUp ? handleNext : handleEmailAuth}
              disabled={!formData.password || (isSignUp && formData.password.length < 6) || isLoading}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Please wait..." : (isSignUp ? "Next" : "Sign In")}
            </Button>
          </motion.div>
        );

      case 'name':
        return (
          <motion.div 
            key="name"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">What's your name?</h2>
            </div>
            
            <Input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border-gray-600 text-white py-6 text-lg rounded-lg focus:border-yeild-yellow focus:ring-yeild-yellow"
              autoFocus
            />
            
            <Button 
              onClick={handleNext}
              disabled={!formData.name}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              Next
            </Button>
          </motion.div>
        );

      case 'preference':
        return (
          <motion.div 
            key="preference"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">What do you prefer?</h2>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setUserPreference('tasks')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  userPreference === 'tasks' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-lg">Tasks</div>
              </button>
              
              <button
                onClick={() => setUserPreference('referrals')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  userPreference === 'referrals' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-lg">Referrals</div>
              </button>
              
              <button
                onClick={() => setUserPreference('both')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  userPreference === 'both' 
                    ? 'border-yeild-yellow bg-yeild-yellow/10 text-yeild-yellow' 
                    : 'border-gray-600 text-white hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-lg">Both</div>
              </button>
            </div>
            
            <Button 
              onClick={handleEmailAuth}
              disabled={!userPreference || isLoading}
              className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Continue"}
            </Button>
          </motion.div>
        );

      default:
        return null;
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="text-white hover:bg-gray-800 p-2 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <span className="text-yeild-yellow text-xl font-bold">YEILD</span>
        </div>
        
        <div className="w-10"></div>
      </div>

      {currentStep > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Step {currentStep} of {steps.length - 1}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-yeild-yellow h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {getStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAuth;
