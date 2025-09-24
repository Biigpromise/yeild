
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthOperations = () => {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      return { data, error };
    }

    // Check if email is confirmed
    const needsEmailConfirmation = !data.user?.email_confirmed_at;
    
    return { data, error, needsEmailConfirmation };
  };

  const signUp = async (
    email: string, 
    password: string, 
    name?: string, 
    userType: string = 'user', 
    userData?: any, 
    redirectUrl?: string
  ) => {
    const metadata: any = {
      name: name || email.split('@')[0],
      user_type: userType,
      ...userData
    };

    try {
      // First send verification code via our custom function
      const { data: codeData, error: codeError } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email, 
          type: 'signup' 
        }
      });

      if (codeError) {
        console.error("Error sending verification code:", codeError);
        return { data: null, error: codeError };
      }

      if (!codeData?.success) {
        console.error("Verification code sending failed:", codeData);
        return { data: null, error: { message: codeData?.message || 'Failed to send verification code' } };
      }

      // Create user account but DON'T sign them in automatically - they need to verify email first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: undefined // Disable Supabase's email confirmation since we use custom
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        return { data, error };
      }

      // Important: Don't auto-sign the user in - they must verify their email first
      // Sign them out immediately if they were auto-signed in
      if (data.session) {
        await supabase.auth.signOut();
      }

      return { 
        data: { ...data, session: null }, // Remove session to prevent auto-login
        error: null, 
        user: data.user,
        needsEmailVerification: true,
        verificationToken: codeData.token
      };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider: string, userType: string = 'user') => {
    try {
      const redirectUrl = `https://stehjqdbncykevpokcvj.supabase.co/auth/v1/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            user_type: userType
          }
        }
      });

      if (error) {
        console.error("OAuth sign in error:", error);
      }

      return { data, error };
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      return { data: null, error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      // Use our custom verification code function instead of Supabase's built-in
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email, 
          type: 'signup' 
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return { error };
      }

      if (!data?.success) {
        return { error: { message: data?.message || 'Failed to resend verification code' } };
      }

      return { error: null, token: data.token };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return { error: { message: error.message || 'Failed to resend confirmation email' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Initiating password reset for:', email);
    
    try {
      // Call our custom password reset function
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { email }
      });

      if (error) {
        console.error('Password reset function error:', error);
        throw new Error(error.message || 'Failed to send password reset email');
      }

      // Check if the response indicates failure
      if (data && !data.success) {
        console.error('Password reset failed:', data.error);
        throw new Error(data.error || 'Failed to send password reset email');
      }

      console.log('Password reset email sent successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: { message: error.message || 'Failed to send password reset email' } };
    }
  };

  const updateUserPassword = async (password: string) => {
    console.log('Updating user password');
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('Password updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return { data: null, error };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserPassword,
    signInWithProvider,
    resendConfirmation,
  };
};
