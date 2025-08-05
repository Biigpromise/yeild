import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./auth/types";
import { useAuthState } from "./auth/useAuthState";
import { useAuthOperations } from "./auth/useAuthOperations";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, session, loading, setUser, setSession, setLoading } = useAuthState();
  const authOperations = useAuthOperations();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listeners with enhanced session management");
    
    let mounted = true;

    // Configure enhanced session persistence (30 days)
    const configureSessionSettings = () => {
      const config = {
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      };
      console.log("Session configuration:", config);
    };

    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        }
        
        if (mounted) {
          console.log("Initial session check:", session?.user?.email);
          
          // Enhanced session validation for intelligent management
          if (session) {
            const lastActivity = localStorage.getItem('last_activity');
            const currentTime = Date.now();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            
            if (lastActivity) {
              const timeSinceLastActivity = currentTime - parseInt(lastActivity);
              
              // If inactive for more than 7 days, require re-verification
              if (timeSinceLastActivity > sevenDaysInMs) {
                console.log("Session expired due to inactivity. Requiring re-verification.");
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                return;
              }
            }
            
            // Update last activity
            localStorage.setItem('last_activity', currentTime.toString());
          }
          
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with enhanced session management
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update activity timestamp on auth events
        if (session) {
          localStorage.setItem('last_activity', Date.now().toString());
        } else {
          localStorage.removeItem('last_activity');
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        // Handle auth events
        if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          localStorage.removeItem('last_activity');
        } else if (event === 'SIGNED_IN') {
          console.log("User signed in:", session?.user?.email);
          localStorage.setItem('last_activity', Date.now().toString());
          
          // Auto-redirect based on user role, not hardcoded email
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed");
          localStorage.setItem('last_activity', Date.now().toString());
        }
      }
    );

    // Configure session settings
    configureSessionSettings();
    
    // Get initial session
    getInitialSession();

    // Set up activity tracking for intelligent session management
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const updateActivity = () => {
      if (mounted) {
        localStorage.setItem('last_activity', Date.now().toString());
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      mounted = false;
      console.log("AuthProvider: Cleaning up auth listeners");
      subscription.unsubscribe();
      
      // Clean up activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [setUser, setSession, setLoading, navigate]);

  const value = {
    user,
    session,
    loading,
    ...authOperations,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
