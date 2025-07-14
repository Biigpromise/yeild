import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_failed');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to auth');
          navigate('/auth');
          return;
        }

        // Get user type and next path from query params
        const userType = searchParams.get('user_type') || 'user';
        const next = searchParams.get('next');

        console.log('OAuth callback successful, user type:', userType);

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // If it's a brand signup, redirect to brand application
        if (userType === 'brand') {
          navigate('/brand-signup');
          return;
        }

        // If user has no profile or incomplete profile, go to progressive auth
        if (!profile || !profile.name) {
          navigate('/auth/progressive?step=1');
          return;
        }

        // User is complete, redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;