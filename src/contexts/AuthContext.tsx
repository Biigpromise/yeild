
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthOperations } from './auth/useAuthOperations';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, userType?: string, metadata?: any, redirectUrl?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'twitter', userType?: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const {
    signUp: authSignUp,
    signIn: authSignIn,
    signOut: authSignOut,
    signInWithProvider: authSignInWithProvider,
    resetPassword: authResetPassword,
    resendConfirmation: authResendConfirmation,
  } = useAuthOperations();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listeners');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user || 'no user');
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle post-auth navigation
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // Check if user has brand application or brand profile
              const { data: brandApp } = await supabase
                .from('brand_applications')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              const { data: brandProfile } = await supabase
                .from('brand_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              // Navigate to appropriate dashboard
              if (brandApp || brandProfile) {
                console.log('Navigating to brand dashboard');
                navigate('/brand-dashboard');
              } else {
                console.log('Navigating to user dashboard');
                navigate('/dashboard');
              }
            } catch (error) {
              console.error('Error checking user type:', error);
              navigate('/dashboard'); // Default to user dashboard
            }
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session retrieved:', session?.user || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listeners');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      return await authSignIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, userType?: string, metadata?: any, redirectUrl?: string) => {
    try {
      setLoading(true);
      return await authSignUp(email, password, fullName, userType, metadata, redirectUrl);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      setUser(null);
      setSession(null);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter', userType?: string) => {
    try {
      setLoading(true);
      return await authSignInWithProvider(provider, userType);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authResetPassword(email);
  };

  const resendConfirmation = async (email: string) => {
    return await authResendConfirmation(email);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    resetPassword,
    resendConfirmation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
