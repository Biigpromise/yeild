
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

interface SignUpData {
  email: string;
  password: string;
  name: string;
  userType: 'user' | 'brand';
  referralCode?: string;
  brandData?: {
    companyName: string;
    website: string;
    industry: string;
    companySize: string;
    taskTypes: string[];
    budget: string;
    goals: string;
  };
}

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }
    
    setResendLoading(true);
    try {
      // Try custom verification email first
      const { data: emailData, error: customError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          name: name || email.split('@')[0],
          confirmationUrl: `${window.location.origin}/auth/callback`
        }
      });

      if (customError) {
        console.error('Custom verification email failed:', customError);
        // Fallback to Supabase's default resend
        const { error: fallbackError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (fallbackError) {
          console.error('Fallback resend failed:', fallbackError);
          toast.error('Failed to resend confirmation email. Please try again in a few minutes.');
          return;
        }
      }
      
      toast.success('Confirmation email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast.error('Failed to resend confirmation email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    
    if (!agreeTerms) {
      setSignUpError('Please agree to the terms and conditions');
      return;
    }

    const referralCode = searchParams.get('ref');
    
    const signUpData: SignUpData = {
      email,
      password,
      name,
      userType: 'user',
      referralCode: referralCode || undefined
    };

    const result = await signUp(signUpData);
    
    if (result.success) {
      setAwaitingConfirmation(true);
    } else {
      setSignUpError(result.error);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      // Prepare metadata
      const metadata: any = {
        name: data.name,
        user_type: data.userType
      };

      // Add brand-specific data to metadata
      if (data.userType === 'brand' && data.brandData) {
        metadata.brand_application_data = data.brandData;
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Handle referral signup if referral code is provided
      if (data.referralCode) {
        const result = await referralService.processReferralSignup(data.referralCode, authData.user.id);
        if (result.success) {
          toast.success('Account created successfully! Referral bonus will be activated after completing your first task.');
        } else {
          toast.warning('Account created, but referral code may be invalid.');
        }
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
      }

      return { success: true, data: authData };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    signUp, 
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    setShowPassword,
    handleSignUp,
    awaitingConfirmation,
    signUpError,
    setAwaitingConfirmation,
    handleResendConfirmation,
    resendLoading
  };
};
