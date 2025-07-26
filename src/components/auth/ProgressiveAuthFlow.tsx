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
import { handleAuthError } from '@/contexts/auth/authErrorHandler';
import { ForgotPasswordLink } from './ForgotPasswordLink';

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
    
    console.log("URL analysis:", { typeParam, modeParam });
    
    // Set user type if specified
    if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
    }
    
    // Check for explicit signin mode
    const isSigninMode = modeParam === 'signin' || typeParam === 'signin';
    
    // For URLs like /auth?type=user or /auth?type=brand, default to sign-in since most are returning users
    if (typeParam === 'user' || typeParam === 'brand') {
      setIsLogin(true);
      setCurrentStep('email'); // Skip user type selection for specific types
    } else if (isSigninMode) {
      setIsLogin(true);
      setCurrentStep('email');
    } else if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      // For sign-up mode with type specified
      setCurrentStep('email');
    }
  }, [searchParams]);

  // Redirect if user is already logged in
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
      // In login mode, go back to userType which will show signin interface
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
          const friendlyError = handleAuthError(error, 'sign in');
          toast.error(friendlyError, {
            action: friendlyError.includes('No account found') ? {
              label: 'Create Account',
              onClick: () => {
                setIsLogin(false);
                toast.dismiss();
              }
            } : undefined
          });
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
          const friendlyError = handleAuthError(error, 'sign up');
          toast.error(friendlyError);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      {/* Header with progress */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={currentStep === 'userType' ? () => navigate('/') : handleBack}
            variant="ghost"
            className="p-2 text-foreground hover:bg-secondary rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex-1 mx-4">
            <Progress value={getStepProgress()} className="h-2" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
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
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Welcome to <span className="text-warning">YEILD</span></h1>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    {isLogin ? 'Sign in to your account' : 'Choose your account type'}
                  </p>
                </div>

                {isLogin ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-transparent text-foreground text-lg pl-8 py-4 border-0 border-b-2 border-border focus:border-primary focus:outline-none placeholder-muted-foreground"
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={() => setCurrentStep('password')}
                      className="w-full bg-warning hover:bg-warning/90 text-black py-3 text-lg font-semibold"
                      disabled={!formData.email}
                    >
                      Continue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={() => handleUserTypeSelect('user')}
                      variant="outline"
                      className="w-full p-4 sm:p-6 h-auto text-left border-border hover:border-primary hover:bg-secondary group"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-full group-hover:bg-primary/20">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">I'm a <span className="text-warning">User</span></h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">Complete tasks, earn rewards, and build your reputation</p>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary ml-auto flex-shrink-0" />
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleUserTypeSelect('brand')}
                      variant="outline"
                      className="w-full p-4 sm:p-6 h-auto text-left border-border hover:border-primary hover:bg-secondary group"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-full group-hover:bg-primary/20">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">I'm a Brand</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">Create campaigns and connect with your audience</p>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary ml-auto flex-shrink-0" />
                      </div>
                    </Button>
                  </div>
                )}

                {/* Show Google button only if user type is set or if in login mode */}
                {(formData.userType || isLogin) && (
                  <div className="pt-4">
                    <Button
                      onClick={handleGoogleAuth}
                      variant="outline"
                      className="w-full py-3 border-border text-foreground hover:bg-secondary flex items-center justify-center gap-3"
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
                    
                    {isLogin && (
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        Use this if you previously signed up with Google
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <span className="text-muted-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-warning hover:text-warning/80 font-medium transition-colors"
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                    {isLogin ? 'Welcome back!' : "What's your email?"}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isLogin 
                      ? `Sign in to your ${formData.userType || 'account'}` 
                      : "We'll use this to send you updates and notifications"
                    }
                  </p>
                  {formData.userType && (
                    <div className="flex items-center justify-center space-x-2 mt-2 text-warning">
                      {formData.userType === 'brand' ? <Building2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      <span className="text-sm capitalize">{formData.userType} Account</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-transparent text-foreground text-lg pl-8 py-4 border-0 border-b-2 border-border focus:border-primary focus:outline-none placeholder-muted-foreground"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-warning hover:bg-warning/90 text-black py-3 text-lg font-semibold"
                  disabled={!formData.email}
                >
                  Continue
                </Button>

                {/* Google Sign In Button for Email Step */}
                <div className="pt-2">
                  <Button
                    onClick={handleGoogleAuth}
                    variant="outline"
                    className="w-full py-3 border-border text-foreground hover:bg-secondary flex items-center justify-center gap-3"
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
                  
                  {isLogin && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Use this if you previously signed up with Google
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {!isLogin ? (
                    <>
                      <span className="text-muted-foreground">Already have an account? </span>
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-warning hover:text-warning/80 font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">Don't have an account? </span>
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-warning hover:text-warning/80 font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                    {isLogin ? 'Enter your password' : 'Create a secure password'}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isLogin ? 'Welcome back!' : 'Must be at least 6 characters long'}
                  </p>
                </div>

                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-transparent text-foreground text-lg pl-8 pr-10 py-4 border-0 border-b-2 border-border focus:border-primary focus:outline-none placeholder-muted-foreground"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-warning hover:bg-warning/90 text-black py-3 text-lg font-semibold"
                  disabled={!formData.password || isLoading}
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Continue')}
                </Button>

                {isLogin && (
                  <ForgotPasswordLink userType={formData.userType as 'user' | 'brand'} />
                )}
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">What's your name?</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">This will be displayed on your profile</p>
                </div>

                <div className="relative">
                  <User className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-transparent text-foreground text-lg pl-8 py-4 border-0 border-b-2 border-border focus:border-primary focus:outline-none placeholder-muted-foreground"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-warning hover:bg-warning/90 text-black py-3 text-lg font-semibold"
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
                <div className="p-4 bg-primary/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Account created!</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
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