
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl || `${window.location.origin}/auth/callback`,
        ...(userData?.email_confirm === false && { emailRedirectTo: undefined }) // Skip email confirmation if specified
      }
    });

    if (error) {
      console.error("Sign up error:", error);
      return { data, error };
    }

    return { data, error, user: data.user };
  };

  const signInWithProvider = async (provider: string, userType: string = 'user') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          user_type: userType
        }
      }
    });

    if (error) {
      console.error("OAuth sign in error:", error);
    }

    return { data, error };
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return { error };
      }

      return { error: null };
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
