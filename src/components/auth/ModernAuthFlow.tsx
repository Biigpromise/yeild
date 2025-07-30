import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, Lock, User, CheckCircle, Building2, Users, Sparkles, Zap, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { InputValidator } from '@/services/validation/inputValidator';
import { handleAuthError } from '@/contexts/auth/authErrorHandler';
import { ForgotPasswordLink } from './ForgotPasswordLink';
import { VerificationCodeInput } from './VerificationCodeInput';
import { supabase } from '@/integrations/supabase/client';

type StepType = 'userType' | 'email' | 'password' | 'name' | 'verification' | 'complete';

interface FormData {
  email: string;
  password: string;
  name: string;
  userType: 'user' | 'brand' | '';
  verificationToken?: string;
}

const ModernAuthFlow = () => {
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
    const refParam = searchParams.get('ref');
    
    if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
    }
    
    const isSignupMode = modeParam === 'signup' || refParam;
    const isSigninMode = modeParam === 'signin' || typeParam === 'signin';
    
    if (refParam) {
      setIsLogin(false);
      setCurrentStep('userType');
    } else if (typeParam === 'user' || typeParam === 'brand') {
      setIsLogin(true);
      setCurrentStep('email');
    } else if (isSigninMode) {
      setIsLogin(true);
      setCurrentStep('email');
    } else if (isSignupMode) {
      setIsLogin(false);
      setCurrentStep('userType');
    }
  }, [searchParams]);

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
    const steps = isLogin ? ['userType', 'email', 'verification'] : ['userType', 'email', 'verification', 'password', 'name'];
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
      await sendVerificationCode();
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

  const sendVerificationCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email: formData.email, 
          type: isLogin ? 'signin' : 'signup' 
        }
      });

      if (error) throw error;

      if (data.success) {
        setFormData(prev => ({ ...prev, verificationToken: data.token }));
        setCurrentStep('verification');
        toast.success('Verification code sent to your email!');
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      setCurrentStep('userType');
    } else if (currentStep === 'verification') {
      setCurrentStep('email');
    } else if (currentStep === 'password') {
      setCurrentStep('verification');
    } else if (currentStep === 'name') {
      setCurrentStep('password');
    }
  };

  const handleVerificationComplete = (token: string) => {
    setFormData(prev => ({ ...prev, verificationToken: token }));
    if (isLogin) {
      toast.success("Successfully signed in!");
      navigate(formData.userType === 'brand' ? '/brand-dashboard' : '/dashboard');
    } else {
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
        }
      } else {
        console.log('Starting signup process for:', formData.email);
        
        const { error, user } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.userType,
          { email_confirm: false }, // Skip email confirmation since we already verified with code
          undefined // No redirect URL needed since we're not using email confirmation
        );
        
        if (error) {
          console.error('Signup error:', error);
          const friendlyError = handleAuthError(error, 'sign up');
          toast.error(friendlyError);
          return;
        }

        if (user) {
          console.log('User created successfully:', user.email);
          
          // For regular users, show success and redirect
          if (formData.userType === 'user') {
            setCurrentStep('complete');
            toast.success("Account created successfully! Redirecting to your dashboard...");
            
            setTimeout(() => {
              navigate('/onboarding');
            }, 2000);
          }
          
          // For brand users, show success and next steps
          else if (formData.userType === 'brand') {
            setCurrentStep('complete');
            toast.success("Account created successfully! Complete your brand application to get started.");
            
            setTimeout(() => {
              navigate('/brand-onboarding');
            }, 2000);
          }
        } else {
          console.error('No user returned from signup');
          toast.error("Account creation failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in handleSubmit:', error);
      toast.error("An unexpected error occurred. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-warning/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            onClick={currentStep === 'userType' ? () => navigate('/') : handleBack}
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-secondary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {/* Progress bar */}
          <div className="flex-1 mx-6">
            <div className="relative h-2 bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-warning rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="text-sm font-medium bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center px-6 pb-6" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* User Type Selection */}
            {currentStep === 'userType' && (
              <motion.div
                key="userType"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Logo and title */}
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <img 
                      src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
                      alt="YEILD Logo" 
                      className="w-20 h-20 mx-auto object-contain"
                    />
                  </motion.div>
                  <motion.h1 
                    className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to <span className="bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent">YEILD</span>
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {isLogin ? 'Sign in to your account' : 'Choose your journey'}
                  </motion.p>
                </div>

                {isLogin ? (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
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
                      className="w-full h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!formData.email}
                    >
                      Continue
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleUserTypeSelect('user')}
                        variant="outline"
                        className="w-full h-auto p-0 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-secondary/30 rounded-2xl overflow-hidden group transition-all duration-300"
                      >
                        <div className="p-6 w-full">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-warning/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                              <div className="relative p-3 bg-gradient-to-r from-primary/10 to-warning/10 rounded-full group-hover:from-primary/20 group-hover:to-warning/20 transition-all duration-300">
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="text-lg font-semibold text-foreground mb-1">
                                I'm a <span className="bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent">User</span>
                              </h3>
                              <p className="text-muted-foreground text-sm flex items-center">
                                <Trophy className="w-4 h-4 mr-1" />
                                Complete tasks, earn rewards, build reputation
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleUserTypeSelect('brand')}
                        variant="outline"
                        className="w-full h-auto p-0 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-secondary/30 rounded-2xl overflow-hidden group transition-all duration-300"
                      >
                        <div className="p-6 w-full">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-warning/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                              <div className="relative p-3 bg-gradient-to-r from-primary/10 to-warning/10 rounded-full group-hover:from-primary/20 group-hover:to-warning/20 transition-all duration-300">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="text-lg font-semibold text-foreground mb-1">I'm a Brand</h3>
                              <p className="text-muted-foreground text-sm flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                Create campaigns, connect with audience
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Google button */}
                {(formData.userType || isLogin) && (
                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-border/30 to-border/10 rounded-2xl"></div>
                      <Button
                        onClick={handleGoogleAuth}
                        variant="outline"
                        className="w-full h-14 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-secondary/30 rounded-2xl text-foreground font-medium flex items-center justify-center gap-3 transition-all duration-300"
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
                    
                    {isLogin && (
                      <div className="text-center text-sm text-muted-foreground mt-3">
                        Use this if you previously signed up with Google
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Switch mode */}
                <motion.div 
                  className="text-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-muted-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-warning hover:text-warning/80 font-medium transition-colors"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Email Step */}
            {currentStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-warning/20 rounded-full flex items-center justify-center"
                  >
                    <Mail className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3 text-foreground">
                    {isLogin ? 'Welcome back!' : "What's your email?"}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {isLogin 
                      ? `Sign in to your ${formData.userType || 'account'}` 
                      : "We'll use this to send you updates and notifications"
                    }
                  </p>
                  {formData.userType && (
                    <div className="flex items-center justify-center space-x-2 mt-4 px-4 py-2 bg-secondary/30 rounded-full inline-flex">
                      {formData.userType === 'brand' ? <Building2 className="w-4 h-4 text-warning" /> : <Users className="w-4 h-4 text-warning" />}
                      <span className="text-sm capitalize font-medium text-warning">{formData.userType} Account</span>
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.email) {
                    handleNext();
                  }
                }}>
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
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!formData.email || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </div>
                      ) : (
                        'Continue'
                      )}
                    </Button>
                  </div>
                </form>

                {/* Google Auth */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-border/30 to-border/10 rounded-2xl"></div>
                  <Button
                    onClick={handleGoogleAuth}
                    variant="outline"
                    className="w-full h-14 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-secondary/30 rounded-2xl text-foreground font-medium flex items-center justify-center gap-3 transition-all duration-300"
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
                    <div className="text-center text-sm text-muted-foreground mt-3">
                      Use this if you previously signed up with Google
                    </div>
                  )}
                </div>

                {/* Switch mode */}
                <div className="text-center pt-4">
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

            {/* Verification Step */}
            {currentStep === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <VerificationCodeInput
                  email={formData.email}
                  type={isLogin ? 'signin' : 'signup'}
                  onVerified={handleVerificationComplete}
                  onBack={handleBack}
                  onResend={sendVerificationCode}
                />
              </motion.div>
            )}

            {/* Password Step */}
            {currentStep === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-warning/20 rounded-full flex items-center justify-center"
                  >
                    <Lock className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3 text-foreground">
                    {isLogin ? 'Enter your password' : 'Create a secure password'}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {isLogin ? 'Welcome back!' : 'Must be at least 6 characters long'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-warning/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                    <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-1 group-focus-within:border-primary/50">
                      <div className="flex items-center px-4 py-4">
                        <Lock className="w-5 h-5 text-muted-foreground mr-3" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="flex-1 bg-transparent text-foreground text-lg placeholder-muted-foreground focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!formData.password || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {isLogin ? 'Signing in...' : 'Creating...'}
                      </div>
                    ) : (
                      isLogin ? 'Sign In' : 'Continue'
                    )}
                  </Button>

                  {isLogin && (
                    <div className="text-center">
                      <ForgotPasswordLink userType={formData.userType as 'user' | 'brand'} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Name Step */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-warning/20 rounded-full flex items-center justify-center"
                  >
                    <User className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3 text-foreground">What's your name?</h2>
                  <p className="text-muted-foreground text-lg">This will be displayed on your profile</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.name && !isLoading) {
                    handleSubmit();
                  }
                }}>
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-warning/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-1 group-focus-within:border-primary/50">
                        <div className="flex items-center px-4 py-4">
                          <User className="w-5 h-5 text-muted-foreground mr-3" />
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="flex-1 bg-transparent text-foreground text-lg placeholder-muted-foreground focus:outline-none"
                            autoFocus
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!formData.name || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative w-24 h-24 mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-warning/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-primary to-warning rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-3 text-foreground">Account created!</h2>
                  <p className="text-muted-foreground text-lg">
                    Please check your email to verify your account. You'll be redirected to your dashboard shortly.
                  </p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center space-x-2 text-warning"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Welcome to YEILD!</span>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthFlow;
