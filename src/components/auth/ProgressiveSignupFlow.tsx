
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, User as UserIcon, Mail } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProgressiveSignupFlowProps {
  userType: 'user' | 'brand';
  onBack: () => void;
  onSwitchToSignin?: () => void;
}

const ProgressiveSignupFlow: React.FC<ProgressiveSignupFlowProps> = ({ 
  userType, 
  onBack, 
  onSwitchToSignin 
}) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { signUp, signInWithProvider } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      setStep(3);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await signUp(formData.email, formData.password, formData.name, userType);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider('google', userType);
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      console.error('Google sign up error:', error);
      toast.error(error.message || 'An error occurred during Google sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <UserIcon className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
              <p className="text-gray-400">Let's start with your name</p>
            </div>
            
            <div>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg text-white"
              />
            </div>

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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Mail className="w-16 h-16 text-yeild-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Hi {formData.name}!</h2>
              <p className="text-gray-400">What's your email address?</p>
            </div>
            
            <div>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="w-full py-4 px-4 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg text-white"
              />
            </div>

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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create your password</h2>
              <p className="text-gray-400">Make it strong and secure</p>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (6+ characters)"
                  className="w-full py-4 px-4 pr-12 bg-transparent border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0 text-lg text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yeild-yellow hover:bg-yeild-yellow/90 text-black py-4 rounded-full text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-border"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full bg-muted hover:bg-muted/80 text-foreground py-4 rounded-2xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

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
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onBack} 
          className="text-foreground"
        >
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
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        {step < 3 && (
          <div className="mt-8">
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="w-full bg-yeild-yellow hover:bg-yeild-yellow/90 text-black py-4 rounded-full text-lg font-semibold"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveSignupFlow;
