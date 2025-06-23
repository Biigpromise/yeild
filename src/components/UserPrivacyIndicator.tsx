
import React from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDisplay } from '@/utils/userDisplayUtils';

interface UserPrivacyIndicatorProps {
  className?: string;
}

export const UserPrivacyIndicator: React.FC<UserPrivacyIndicatorProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isAnonymous, setIsAnonymous] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      // Check user's current privacy setting
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase
          .from('profiles')
          .select('is_anonymous')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            setIsAnonymous(data?.is_anonymous || false);
          });
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {isAnonymous ? (
        <>
          <EyeOff className="h-3 w-3" />
          <span>Chatting as Anonymous</span>
        </>
      ) : (
        <>
          <Eye className="h-3 w-3" />
          <span>Showing username</span>
        </>
      )}
    </div>
  );
};
