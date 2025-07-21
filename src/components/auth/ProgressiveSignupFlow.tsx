import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Upload, Camera } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ProgressiveSignupFlowProps {
  userType: 'user' | 'brand';
  onBack: () => void;
  onSwitchToSignin?: () => void;
}

interface SignupData {
  name: string;
  email: string;
  dateOfBirth: string;
  verificationCode: string;
  password: string;
  profilePicture: string | null;
  username: string;
}

const ProgressiveSignupFlow: React.FC<ProgressiveSignupFlowProps> = ({ userType, onBack, onSwitchToSignin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SignupData>({
    name: '',
    email: '',
    dateOfBirth: '',
    verificationCode: '',
    password: '',
    profilePicture: null,
    username: ''
  });

  const { signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  // If this is a brand signup, it shouldn't use this flow
  if (userType === 'brand') {
    console.warn('Brand signup should use ModernBrandSignup component');
    onBack();
    return null;
  }

  const steps = [
    { id: 1, title: "Create your account", subtitle: "Join YIELD as a Creator" },
    { id: 2, title: "We sent you a code", subtitle: `Enter it below to verify ${data.email}` },
    { id: 3, title: "You'll need a password", subtitle: "Make sure it's 8 characters or more." },
    { id: 4, title: "Pick a profile picture", subtitle: "Have a favorite selfie? Upload it now." },
    { id: 5, title: "What should we call you?", subtitle: "Your @username is unique. You can always change it later." }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = async () => {
    console.log('handleNext called, current step:', currentStep);
    console.log('Current data:', data);

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      if (currentStep === 1) {
        if (!data.name || !data.email || !data.dateOfBirth) {
          toast.error('Please fill in all fields');
          return;
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!data.verificationCode || data.verificationCode.length !== 6) {
          toast.error('Please enter the 6-digit verification code');
          return;
        }
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!data.password || data.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return;
        }
        setCurrentStep(4);
      } else if (currentStep === 4) {
        setCurrentStep(5);
      } else if (currentStep === 5) {
        if (!data.username) {
          toast.error('Please enter a username');
          return;
        }
        await completeUserSignup();
      }
    } catch (error: any) {
      console.error('handleNext error:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeUserSignup = async () => {
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await signUp(
        data.email,
        data.password,
        data.name,
        'user',
        {
          username: data.username,
          profile_picture_url: data.profilePicture,
          date_of_birth: data.dateOfBirth
        },
        redirectUrl
      );
      
      if (error) {
        console.error('Complete signup error:', error);
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
          toast.error('An account with this email already exists. Please try signing in instead.');
          if (onSwitchToSignin) {
            onSwitchToSignin();
          }
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/onboarding');
      }
    } catch (error: any) {
      console.error('Complete signup unexpected error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting Google sign-in for user type:', userType);
      
      const { error } = await signInWithProvider('google', 'user');
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast.error(error.message || 'Google sign-in failed');
      } else {
        console.log('Google sign-in initiated successfully');
        // The redirect will be handled by the OAuth callback
      }
    } catch (error: any) {
      console.error('Google signup unexpected error:', error);
      toast.error(error.message || 'An error occurred with Google sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const generateUsername = (name: string) => {
    const baseUsername = name.toLowerCase().replace(/\s+/g, '');
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${baseUsername}${randomNumber}`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-muted hover:bg-muted/80 text-foreground py-4 rounded-2xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-border"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Date of birth</label>
                <Input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                  className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-2xl font-bold border-b-2 border-muted-foreground/30 rounded-none bg-transparent focus:border-primary"
                  value={data.verificationCode[index] || ''}
                  onChange={(e) => {
                    const newCode = data.verificationCode.split('');
                    newCode[index] = e.target.value;
                    setData({ ...data, verificationCode: newCode.join('') });
                  }}
                />
              ))}
            </div>
            
            <div className="text-center">
              <button className="text-primary text-sm">
                Didn't receive email?
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full py-4 px-4 pr-12 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>By signing up, you agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>, including <span className="text-primary">Cookie Use</span>. YIELD may use your contact information, including your email address and phone number for purposes outlined in our Privacy Policy, like keeping your account secure and personalizing our services, including ads. <span className="text-primary">Learn more</span>. Others will be able to find you by email or phone number, when provided, unless you choose otherwise <span className="text-primary">here</span>.</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-muted border-4 border-muted-foreground/20 flex items-center justify-center">
                  {data.profilePicture ? (
                    <img src={data.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-muted-foreground/40"></div>
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <p className="text-center text-muted-foreground">
              You can also create your own.
            </p>

            <div className="flex justify-center gap-4">
              {['😍', '😊', '😐', '😢', '❤️', '😳'].map((emoji) => (
                <button
                  key={emoji}
                  className="w-12 h-12 rounded-full border border-muted-foreground/30 flex items-center justify-center text-2xl hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button className="text-muted-foreground underline">
                Skip for now
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-lg">@</span>
                <Input
                  type="text"
                  value={data.username}
                  onChange={(e) => setData({ ...data, username: e.target.value })}
                  className="w-full py-4 pl-8 pr-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg"
                  placeholder=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  `@${data.name.toLowerCase().replace(/\s+/g, '')}`,
                  `@${generateUsername(data.name)}`,
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setData({ ...data, username: suggestion.replace('@', '') })}
                    className="px-3 py-1 text-sm bg-muted rounded-full hover:bg-muted/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button className="text-muted-foreground underline">
                Skip for now
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={handleBack} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center">
          <img src="/lovable-uploads/c0942c4f-38c3-4a43-9d01-3f429f5860ee.png" alt="YIELD" className="h-8" />
        </div>
        <div className="w-6"></div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 max-w-md mx-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{currentStepData.title}</h1>
            <p className="text-muted-foreground">{currentStepData.subtitle}</p>
          </div>

          {renderStepContent()}
        </motion.div>

        {/* Next Button */}
        <div className="mt-12">
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full bg-yeild-yellow hover:bg-yeild-yellow/90 text-black py-4 rounded-full text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              currentStep === 5 ? 'Sign up' : 'Next'
            )}
          </Button>
        </div>

        {/* Sign in option */}
        {onSwitchToSignin && (
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onSwitchToSignin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveSignupFlow;
