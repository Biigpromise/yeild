
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError } from "./authErrorHandler";
import { sendWelcomeEmail, sendConfirmationEmail } from "./emailService";

export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, name?: string, additionalData?: Record<string, any>) => {
    try {
      console.log("Attempting signup for:", email);
      
      // Input validation
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { user: null, error };
      }

      if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters long");
        return { user: null, error };
      }

      // Use the current origin as the redirect URL - this will work for both preview and deployed versions
      const redirectUrl = window.location.origin;
      console.log("Using redirect URL:", redirectUrl);

      const signUpData = {
        ...(name ? { name } : {}),
        ...additionalData
      };
      
      // Create user without sending Supabase confirmation email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: Object.keys(signUpData).length > 0 ? signUpData : undefined
          // Note: Removed emailRedirectTo to prevent Supabase from sending confirmation emails
        }
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'signup');
        return { user: null, error: { ...error, message: friendlyMessage } };
      }

      // Send both welcome and confirmation emails after successful signup
      if (data.user && !error) {
        // Send welcome email
        await sendWelcomeEmail(email, name);
        
        // Send confirmation email with code and return the code
        const confirmationCode = await sendConfirmationEmail(email, name);
        
        // Store the confirmation code temporarily (you might want to use a more secure storage)
        if (confirmationCode) {
          localStorage.setItem('pendingConfirmationCode', confirmationCode);
          localStorage.setItem('pendingConfirmationEmail', email);
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

  const verifyConfirmationCode = async (inputCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedCode = localStorage.getItem('pendingConfirmationCode');
      const email = localStorage.getItem('pendingConfirmationEmail');
      
      if (!storedCode || !email) {
        return { success: false, error: "No pending confirmation found" };
      }
      
      if (inputCode === storedCode) {
        // Clear the stored data
        localStorage.removeItem('pendingConfirmationCode');
        localStorage.removeItem('pendingConfirmationEmail');
        
        // In a real implementation, you'd verify with Supabase here
        // For now, we'll just return success
        return { success: true };
      } else {
        return { success: false, error: "Invalid confirmation code" };
      }
    } catch (error) {
      console.error("Error verifying confirmation code:", error);
      return { success: false, error: "Verification failed" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Attempting sign in for:", email);
      
      // Input validation
      if (!email || !password) {
        const error = new Error("Email and password are required");
        return { error };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const friendlyMessage = handleAuthError(error, 'sign in');
        return { error: { ...error, message: friendlyMessage } };
      }

      console.log("AuthContext: Sign in successful");
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
      }
    } catch (error) {
      console.error("Sign out unexpected error:", error);
      toast.error("An error occurred while signing out");
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      console.log("AuthContext: Attempting provider sign in with:", provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
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
      
      // Input validation
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

  return {
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    verifyConfirmationCode,
  };
};
