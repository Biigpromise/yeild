
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
      // Use our custom verification code function
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          type: 'signup'
        }
      });

      if (error || !data?.success) {
        console.error('Custom verification code failed:', error);
        toast.error(data?.message || 'Failed to resend verification code. Please try again.');
        return;
      }
      
      toast.success('Verification code sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      toast.error('Failed to resend verification code. Please try again later.');
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
    
    if (result.success && result.needsVerification) {
      // Navigate to verification page with user data
      window.location.href = `/verify-signup-code?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&userType=user`;
    } else if (result.success) {
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

      // Send verification code first
      const { data: codeData, error: codeError } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email: data.email, 
          type: 'signup' 
        }
      });

      if (codeError || !codeData?.success) {
        throw new Error(codeData?.message || 'Failed to send verification code');
      }

      // Create user account without built-in email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
          emailRedirectTo: undefined // Disable Supabase's email confirmation
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
        // Store referral code for later processing after verification
        sessionStorage.setItem('pendingReferral', JSON.stringify({
          referralCode: data.referralCode,
          userId: authData.user.id
        }));
      }

      // Store verification token for later use
      sessionStorage.setItem('verificationToken', codeData.token);

      return { success: true, data: authData, needsVerification: true };
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
