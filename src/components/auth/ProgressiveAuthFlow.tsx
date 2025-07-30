import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

  const { signIn, signUp, user, loading, resetPassword, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize based on URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const modeParam = searchParams.get('mode');
    
    console.log('URL params:', { typeParam, modeParam });
    
    if (typeParam && (typeParam === 'user' || typeParam === 'brand')) {
      setFormData(prev => ({ ...prev, userType: typeParam as 'user' | 'brand' }));
      setCurrentStep('email');
      setIsLogin(false); // Default to signup for new users with pre-selected type
      console.log('Set userType to:', typeParam, 'and switched to signup mode');
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
    console.log('handleNext called, current step:', currentStep, 'formData:', formData);
    
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
        console.log('UserType already set, submitting:', formData.userType);
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
    console.log('handleSubmit called with:', { isLogin, formData });
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error('Sign in failed: ' + error.message);
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        // For signup, send verification code instead of creating account immediately
        console.log('Sending verification code for signup:', formData.email);

        const { error } = await supabase.functions.invoke('send-verification-code', {
          body: { 
            email: formData.email,
            type: 'signup'
          }
        });

        if (error) {
          console.error('Send verification code error:', error);
          toast.error(error.message || 'Failed to send verification code');
          return;
        }

        toast.success('Verification code sent to your email!');
        
        // Navigate to verification page with form data in URL params
        const searchParams = new URLSearchParams({
          email: formData.email,
          password: formData.password, // Store temporarily for account creation
          name: formData.name || '',
          userType: formData.userType || 'user'
        });
        navigate(`/verify-signup-code?${searchParams.toString()}`);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Something went wrong: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeSelect = (type: 'user' | 'brand') => {
    console.log('User type selected:', type);
    setFormData(prev => ({ ...prev, userType: type }));
    // Don't auto-submit, show next button instead
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
        console.error('Reset password error:', error);
        toast.error('Failed to send reset email: ' + error.message);
      } else {
        toast.success('Password reset email sent!');
        // Navigate to verify reset code page with email
        navigate(`/verify-reset-code?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error: any) {
      console.error('Reset password catch error:', error);
      toast.error('Something went wrong: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const userType = formData.userType || (searchParams.get('type') as 'user' | 'brand') || 'user';
      
      const { error } = await signInWithProvider('google', userType);
      
      if (error) {
        console.error('Google sign in error:', error);
        toast.error('Failed to sign in with Google: ' + error.message);
      }
      // Note: Don't show success message here as it will redirect
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('Something went wrong with Google sign in');
    } finally {
      setIsLoading(false);
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

  const shouldShowNextButton = () => {
    // Always show Next button except on userType step (where buttons are the actions)
    return currentStep !== 'userType';
  };

  console.log('Rendering with:', { currentStep, isLogin, formData, shouldShowNextButton: shouldShowNextButton() });

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
                    className={`w-full p-4 text-left border-2 rounded-xl transition-colors group ${
                      formData.userType === 'user' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-medium text-foreground group-hover:text-primary">Complete tasks & earn</div>
                    <div className="text-sm text-muted-foreground">I'm a user</div>
                  </button>
                  
                  <button
                    onClick={() => handleUserTypeSelect('brand')}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-colors group ${
                      formData.userType === 'brand' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-medium text-foreground group-hover:text-primary">Create campaigns</div>
                    <div className="text-sm text-muted-foreground">I'm a brand</div>
                  </button>
                </div>
              )}

              {/* Next Button - Always show except on userType step */}
              {shouldShowNextButton() && (
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

              {/* Next Button for userType step - only show if type is selected */}
              {currentStep === 'userType' && formData.userType && (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                  ) : (
                    'Continue'
                  )}
                </Button>
              )}

              {/* Google Sign In Button */}
              {currentStep === 'email' && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-12 border-2 border-border hover:border-primary transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLoading ? 'Signing in...' : `Continue with Google`}
                  </Button>
                </div>
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