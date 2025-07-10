
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;  
  loading: boolean;
  signUp: (email: string, password: string, name?: string, additionalData?: Record<string, any>) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'twitter') => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  verifyConfirmationCode: (inputCode: string) => Promise<{ success: boolean; error?: string }>;
}
