import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SessionRecovery = () => {
  const { user, session } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Check for session recovery needs
    const checkSessionHealth = async () => {
      if (!user || !session) return;

      try {
        // Test if the current session is valid by making a simple API call
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error && error.message.includes('JWT')) {
          console.log('Session appears invalid, attempting recovery...');
          setIsRecovering(true);
          
          // Try to refresh the session
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            toast.error('Session expired. Please sign in again.');
            await supabase.auth.signOut();
          } else if (data.session) {
            console.log('Session refreshed successfully');
            toast.success('Session recovered');
          }
          
          setIsRecovering(false);
        }
      } catch (error) {
        console.error('Session health check failed:', error);
        setIsRecovering(false);
      }
    };

    // Check session health on mount and every 5 minutes
    checkSessionHealth();
    const interval = setInterval(checkSessionHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session]);

  // Listen for auth errors globally
  useEffect(() => {
    const handleAuthError = async (error: any) => {
      if (error?.message?.includes('JWT') || error?.message?.includes('session')) {
        console.log('Auth error detected, attempting recovery:', error);
        setIsRecovering(true);
        
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Auto-recovery failed:', refreshError);
            await supabase.auth.signOut();
          }
        } catch (refreshError) {
          console.error('Auto-recovery error:', refreshError);
          await supabase.auth.signOut();
        }
        
        setIsRecovering(false);
      }
    };

    // This is a simple error listener - in a real app you might want a more sophisticated approach
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('JWT') || event.reason?.message?.includes('session')) {
        handleAuthError(event.reason);
      }
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleAuthError);
    };
  }, []);

  if (isRecovering) {
    return (
      <div className="fixed top-4 right-4 bg-background border rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-foreground">Recovering session...</span>
        </div>
      </div>
    );
  }

  return null;
};