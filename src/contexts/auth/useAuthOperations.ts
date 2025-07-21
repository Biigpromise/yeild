
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError } from "./authErrorHandler";

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

      // Set redirect URL based on user type or use provided one
      const redirectUrl = emailRedirectTo || (userType === 'brand' 
        ? `${window.location.origin}/brand-dashboard`
        : `${window.location.origin}/onboarding`);
      
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
          await supabase.rpc('handle_referral_signup', {
            new_user_id: data.user.id,
            referral_code_param: refCode
          });
          console.log('Referral code processed during signup:', refCode);
        } catch (refError) {
          console.error('Error processing referral during signup:', refError);
        }
      }

      // For brand users, trigger the brand confirmation email
      if (userType === 'brand' && data.user) {
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-brand-confirmation-email', {
            body: {
              email: email,
              companyName: name || 'Brand User'
            }
          });
          if (emailError) {
            console.error('Error sending brand confirmation email:', emailError);
          } else {
            console.log('Brand confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending brand confirmation email:', emailError);
        }
      }

      console.log("Signup successful");
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'sign in');
        return { error: { ...error, message: friendlyMessage } };
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
      
      // Use HTTPS for production domain
      const redirectUrl = `https://yeildsocials.com/auth/callback`;
      
      const queryParams: Record<string, string> = {
        user_type: userType || 'user',
        next: userType === 'brand' ? '/brand-signup' : '/auth/progressive'
      };
      
      // Include referral code if present
      if (refCode) {
        queryParams.ref = refCode;
      }
      
      console.log('OAuth redirect URL:', redirectUrl);
      console.log('OAuth query params:', queryParams);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams,
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        console.error('OAuth sign in error:', error);
        
        // Provide specific error messages for OAuth issues
        if (error.message.includes('403') || error.message.includes('access')) {
          toast.error('Google sign-in access denied. Please check your Google OAuth configuration.');
        } else if (error.message.includes('redirect')) {
          toast.error('Redirect URL mismatch. Please update your Google OAuth settings.');
        } else if (error.message.includes('invalid_client')) {
          toast.error('Google OAuth client configuration error. Please check your Google Cloud Console settings.');
        } else {
          const friendlyMessage = handleAuthError(error, `${provider} sign in`);
          toast.error(friendlyMessage);
        }
        
        return { error };
      }
      
      console.log('OAuth sign in initiated successfully');
      return { error: null };
    } catch (error) {
      console.error("AuthContext: Provider sign in unexpected error:", error);
      toast.error('An unexpected error occurred with Google sign-in. Please try again.');
      return { error: { message: 'An unexpected error occurred with Google sign-in' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("AuthContext: Attempting password reset for:", email);
      
      if (!email) {
        const error = new Error("Email is required");
        return { error };
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'password reset');
        return { error: { ...error, message: friendlyMessage } };
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

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'resend confirmation');
        return { error: { ...error, message: friendlyMessage } };
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
