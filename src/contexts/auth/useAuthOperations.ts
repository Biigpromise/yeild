import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError, checkEmailExists } from "./authErrorHandler";
import { EmailMonitoringService } from "@/services/emailMonitoring";

const PRODUCTION_DOMAIN = 'https://yeildsocials.com';

export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, name?: string, userType?: string, additionalData?: Record<string, any>, emailRedirectTo?: string) => {
    try {
      console.log("Attempting signup for:", email, "Type:", userType);
      
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { user: null, error };
      }

      if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters long");
        return { user: null, error };
      }

      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');

      // Always use production domain for email confirmation
      const redirectUrl = `${PRODUCTION_DOMAIN}/auth/callback`;
      
      console.log("Using redirect URL:", redirectUrl);

      // For brand signup, include company-specific data
      const signUpData = {
        ...(name ? { name } : {}),
        ...(userType ? { user_type: userType } : {}),
        ...(refCode ? { referral_code: refCode } : {}),
        // For brands, also include company name
        ...(userType === 'brand' && name ? { company_name: name } : {}),
        ...additionalData
      };
      
      // Check if email already exists before attempting signup
      const { exists } = await checkEmailExists(email);
      
      if (exists) {
        return { 
          user: null, 
          error: { 
            message: "An account with this email already exists. Try signing in instead, or use 'Continue with Google' if you created your account with Google." 
          } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: Object.keys(signUpData).length > 0 ? signUpData : undefined,
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'signup');
        return { user: null, error: { ...error, message: friendlyMessage } };
      }

      // Handle referral code after successful signup
      if (refCode && data.user) {
        try {
          await supabase.rpc('handle_referral_signup_improved', {
            new_user_id: data.user.id,
            referral_code_param: refCode
          });
          console.log('Referral code processed during signup:', refCode);
        } catch (refError) {
          console.error('Error processing referral during signup:', refError);
        }
      }

          // Send verification email using Supabase's built-in method with proper redirect
      if (data.user && !data.user.email_confirmed_at) {
        try {
          // Use Supabase's default email for better reliability
          const { error: emailError } = await supabase.auth.resend({
            type: 'signup',
            email: data.user.email,
            options: {
              emailRedirectTo: redirectUrl
            }
          });

          if (emailError) {
            console.error('Email verification failed:', emailError);
            toast.warning("Account created but verification email couldn't be sent. You can request a new one later.");
          } else {
            console.log('Verification email sent successfully');
            toast.success("Account created! Please check your email to verify your account.");
          }
        } catch (emailError) {
          console.error('Unexpected error sending verification email:', emailError);
          toast.warning("Account created but verification email couldn't be sent. You can request a new one later.");
        }
      }

      console.log("Signup successful - email confirmation required");
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Signup unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'signup');
      return { user: null, error: { message: friendlyMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Attempting sign in for:", email);
      
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { error };
      }

      // Check if email exists and if it's OAuth-only before attempting sign in
      const { exists, isOAuthOnly } = await checkEmailExists(email);
      
      if (exists && isOAuthOnly) {
        return { 
          error: { 
            message: "This account was created with Google. Please use 'Continue with Google' to sign in, or reset your password to enable email/password sign in." 
          } 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Provide more specific error for non-existent accounts
        if (error.message.includes('Invalid login credentials') && !exists) {
          return { 
            error: { 
              ...error, 
              message: "No account found with this email address. Please check your email or create a new account." 
            } 
          };
        }
        
        const friendlyMessage = handleAuthError(error, 'sign in');
        return { error: { ...error, message: friendlyMessage } };
      }

      // Check if email is confirmed for regular users - DON'T sign out, just redirect to confirmation
      if (data.user && !data.user.email_confirmed_at) {
        const isBrandUser = data.user.user_metadata?.user_type === 'brand' || 
                           data.user.user_metadata?.company_name;
        
        if (!isBrandUser) {
          console.log("User email not confirmed, will redirect to confirmation page");
          toast.warning("Please check your email and confirm your account to access all features.");
          // Don't sign out - let them stay signed in but redirect to confirmation page
          return { error: null, needsEmailConfirmation: true };
        } else {
          console.log("Brand user signing in without email confirmation");
          toast.warning("Please confirm your email to access all brand features.");
        }
      }

      // Check if brand user has proper metadata, if not, create it
      if (data.user) {
        const isBrandUser = data.user.user_metadata?.user_type === 'brand' || 
                           data.user.user_metadata?.company_name;
        
        if (isBrandUser) {
          try {
            // Check if brand application exists
            const { data: brandApp, error: brandAppError } = await supabase
              .from('brand_applications')
              .select('id')
              .eq('user_id', data.user.id)
              .single();

            if (brandAppError && brandAppError.code === 'PGRST116') {
              // Create brand application if it doesn't exist
              console.log('Creating missing brand application for user:', data.user.id);
              await supabase
                .from('brand_applications')
                .insert({
                  user_id: data.user.id,
                  company_name: data.user.user_metadata?.company_name || data.user.user_metadata?.name || 'Brand User',
                  website: data.user.user_metadata?.website || '',
                  industry: data.user.user_metadata?.industry || 'Other',
                  company_size: data.user.user_metadata?.company_size || '1-10',
                  task_types: data.user.user_metadata?.task_types || [],
                  budget: data.user.user_metadata?.budget || '$1,000 - $5,000',
                  goals: data.user.user_metadata?.goals || 'Brand promotion',
                  email_confirmed: !!data.user.email_confirmed_at
                });
            }

            // Ensure brand role is assigned
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .eq('role', 'brand')
              .single();

            if (!roleData) {
              console.log('Assigning brand role to user:', data.user.id);
              await supabase
                .from('user_roles')
                .insert({
                  user_id: data.user.id,
                  role: 'brand'
                });
            }
          } catch (brandError) {
            console.error('Error handling brand application:', brandError);
          }
        }
      }

      console.log("AuthContext: Sign in successful");
      
      // Check user roles after successful sign in
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);
        
        console.log("User roles:", roleData);
      }

      return { error: null };
    } catch (error) {
      console.error("AuthContext: Sign in unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'sign in');
      return { error: { message: friendlyMessage } };
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Signing out");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out properly");
      } else {
        console.log("Sign out successful");
        toast.success("Signed out successfully");
        // Force redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Sign out unexpected error:", error);
      toast.error("An error occurred while signing out");
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter', userType?: string) => {
    try {
      console.log("AuthContext: Attempting provider sign in with:", provider, "Type:", userType);
      
      // Get current URL for referral code
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      // Always redirect to production domain
      const redirectUrl = `${PRODUCTION_DOMAIN}/auth/callback`;
      
      const queryParams: Record<string, string> = {
        user_type: userType || 'user'
      };
      
      // Include referral code if present
      if (refCode) {
        queryParams.ref = refCode;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, `${provider} sign in`);
        return { error: { ...error, message: friendlyMessage } };
      }
      
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Provider sign in unexpected error:", error);
      const friendlyMessage = handleAuthError(error, `${provider} sign in`);
      return { error: { message: friendlyMessage } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("AuthContext: Attempting password reset for:", email);
      
      if (!email) {
        const error = new Error("Email is required");
        return { error };
      }

      // Check if email exists before attempting reset
      const { exists } = await checkEmailExists(email);
      
      if (!exists) {
        return { 
          error: { 
            message: "No account found with this email address. Please check your email or sign up for a new account." 
          } 
        };
      }

      // Use Supabase's default password reset for better reliability
      const resetUrl = `${PRODUCTION_DOMAIN}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl
      });
      
      if (resetError) {
        const friendlyMessage = handleAuthError(resetError, 'password reset');
        return { error: { ...resetError, message: friendlyMessage } };
      }

      console.log("AuthContext: Password reset email sent successfully");
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Password reset unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'password reset');
      return { error: { message: friendlyMessage } };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log("AuthContext: Resending confirmation email for:", email);
      
      if (!email) {
        const error = new Error("Email is required");
        return { error };
      }

      // Use Supabase's default resend for better reliability
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${PRODUCTION_DOMAIN}/auth/callback`
        }
      });
      
      if (resendError) {
        const friendlyMessage = handleAuthError(resendError, 'resend confirmation');
        return { error: { ...resendError, message: friendlyMessage } };
      }

      console.log("AuthContext: Confirmation email resent successfully");
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Resend confirmation unexpected error:", error);
      const friendlyMessage = handleAuthError(error, 'resend confirmation');
      return { error: { message: friendlyMessage } };
    }
  };

  const verifyConfirmationCode = async (inputCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return { success: true };
    } catch (error) {
      console.error("Error verifying confirmation code:", error);
      return { success: false, error: "Verification failed" };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    resendConfirmation,
    verifyConfirmationCode,
  };
};
