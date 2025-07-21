
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

      // Always use the current origin for email confirmation
      const redirectUrl = emailRedirectTo || `${window.location.origin}/dashboard`;
      
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

      // Send custom verification email for all signups
      if (data.user && !data.user.email_confirmed_at) {
        try {
          console.log('Sending custom verification email to:', email);
          
          if (userType === 'brand') {
            // Send brand confirmation email
            const { error: brandEmailError } = await supabase.functions.invoke('send-brand-confirmation-email', {
              body: { 
                email: email, 
                companyName: name || 'Brand User' 
              }
            });
            
            if (brandEmailError) {
              console.error('Error sending brand confirmation email:', brandEmailError);
              toast.error('Account created but failed to send confirmation email. Please contact support.');
            } else {
              console.log('Brand confirmation email sent successfully');
            }
          } else {
            // Send regular user verification email
            const { error: userEmailError } = await supabase.functions.invoke('send-verification-email', {
              body: { 
                email: email, 
                name: name,
                confirmationUrl: `${window.location.origin}/auth/confirm?token_hash=${data.user.email_change_token_current}&type=signup&redirect_to=${encodeURIComponent(redirectUrl)}`
              }
            });
            
            if (userEmailError) {
              console.error('Error sending user verification email:', userEmailError);
              toast.error('Account created but failed to send verification email. Please contact support.');
            } else {
              console.log('User verification email sent successfully');
            }
          }
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          toast.error('Account created but failed to send verification email. Please contact support.');
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'sign in');
        return { error: { ...error, message: friendlyMessage } };
      }

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        // Sign out the user immediately
        await supabase.auth.signOut();
        return { error: { message: "Please check your email and confirm your account before signing in." } };
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
      
      // Always redirect to OAuth callback handler
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const queryParams: Record<string, string> = {
        user_type: userType || 'user',
        next: '/auth/progressive'
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
      
      // Use our custom verification email function
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          email: email, 
          confirmationUrl: `${window.location.origin}/auth/confirm?redirect_to=${encodeURIComponent(redirectUrl)}`
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
