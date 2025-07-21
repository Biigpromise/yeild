
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

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
          data: metadata
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
        if (result) {
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

  return { signUp, isLoading };
};
