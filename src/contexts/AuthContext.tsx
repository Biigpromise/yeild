
import React, { createContext, useContext, useState, useEffect } from "react";
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
  const { user, session, loading, setUser, setSession, setLoading } = useAuthState();
  const authOperations = useAuthOperations();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listeners");
    
    let mounted = true;

    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update state synchronously to prevent race conditions
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the auth change
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          console.log("User signed out - clearing session");
          // Clear any cached data or redirect if needed
        } else if (event === 'SIGNED_IN') {
          console.log("User signed in:", session?.user?.email);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed for user:", session?.user?.email);
        } else if (event === 'INITIAL_SESSION') {
          console.log("Initial session loaded:", session?.user?.email);
        }
      }
    );

    // THEN get initial session - this will trigger the auth state change listener
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Don't set state here - let the auth state change listener handle it
        console.log("Initial session retrieved:", session?.user?.email);
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Get initial session
    getInitialSession();

    return () => {
      mounted = false;
      console.log("AuthProvider: Cleaning up auth listeners");
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

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
