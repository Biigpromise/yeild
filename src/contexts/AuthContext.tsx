
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from './auth/useAuthOperations';
import { analytics } from '@/services/analytics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, userType?: string, additionalData?: Record<string, any>, emailRedirectTo?: string) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'twitter', userType?: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  verifyConfirmationCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const authOperations = useAuthOperations();

  useEffect(() => {
    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          // Don't throw, just set to null and continue
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          if (session?.user) {
            setUser(session.user);
            // Set user properties in analytics safely
            try {
              const userType = session.user.user_metadata?.user_type || 'user';
              analytics.setUserProperties(session.user.id, {
                user_type: userType,
                email: session.user.email,
                created_at: session.user.created_at
              });
            } catch (analyticsError) {
              console.warn('Analytics error (non-critical):', analyticsError);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          setSession(session);
          if (session?.user) {
            setUser(session.user);
            const userType = session.user.user_metadata?.user_type || 'user';
            
            // Track authentication events safely
            try {
              if (event === 'SIGNED_IN') {
                const loginMethod = session.user.app_metadata?.provider || 'email';
                analytics.trackLogin(session.user.id, userType, loginMethod as 'email' | 'google');
                // Also track signup for new users (first time sign in)
                if (session.user.created_at && new Date(session.user.created_at).getTime() > Date.now() - 60000) {
                  const signupMethod = session.user.app_metadata?.provider || 'email';
                  analytics.trackSignup(session.user.id, userType, signupMethod as 'email' | 'google');
                }
              }
              
              // Set user properties
              analytics.setUserProperties(session.user.id, {
                user_type: userType,
                email: session.user.email,
                created_at: session.user.created_at
              });
            } catch (analyticsError) {
              console.warn('Analytics error (non-critical):', analyticsError);
            }
          } else {
            // Track logout if user was previously signed in
            if (user) {
              try {
                const userType = user.user_metadata?.user_type || 'user';
                analytics.trackLogout(user.id, userType);
              } catch (analyticsError) {
                console.warn('Analytics error (non-critical):', analyticsError);
              }
            }
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const value = {
    user,
    session,
    loading,
    ...authOperations
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
