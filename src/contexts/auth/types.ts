
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any; needsEmailConfirmation?: boolean }>;
  signUp: (email: string, password: string, name?: string, userType?: string, userData?: any, redirectUrl?: string) => Promise<{ data: any; error: any; user?: User }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateUserPassword: (password: string) => Promise<{ data: any; error: any }>;
  signInWithProvider: (provider: string, userType?: string) => Promise<{ data: any; error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}
