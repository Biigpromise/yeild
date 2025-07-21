
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SessionRecovery = () => {
  const { user, session } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Only attempt session recovery if we have a user but potentially invalid session
    if (!user || !session) return;

    let timeoutId: NodeJS.Timeout;

    const checkSessionHealth = async () => {
      try {
        // Test if the current session is valid with a lightweight query
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error && error.message.includes('JWT')) {
          console.log('Session appears invalid, attempting recovery...');
          setIsRecovering(true);
          
          // Try to refresh the session
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            // Only sign out if refresh explicitly fails
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

    // Check session health after a delay and then periodically
    timeoutId = setTimeout(() => {
      checkSessionHealth();
      // Set up periodic checks (every 10 minutes)
      const interval = setInterval(checkSessionHealth, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }, 5000); // Wait 5 seconds before first check

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, session]);

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
