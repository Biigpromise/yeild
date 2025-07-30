
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
      throw error;
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Sign up error:", error);
      throw error;
    }

    return { data, error };
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
  };
};
