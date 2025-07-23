
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
          navigate('/login?error=callback_failed');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login');
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

        // Check user roles
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const userRoles = roleData?.map(r => r.role) || [];
        console.log('User roles after OAuth:', userRoles);

        // Check for admin access
        if (session.user.email === 'yeildsocials@gmail.com' || userRoles.includes('admin')) {
          navigate('/admin');
          return;
        }

        // Check for brand role
        if (userRoles.includes('brand')) {
          navigate('/brand-dashboard');
          return;
        }

        // If it's a brand signup, redirect to brand application
        if (userType === 'brand') {
          navigate('/brand-signup');
          return;
        }

        // Check for referral code and handle it
        const refCode = searchParams.get('ref');
        if (refCode) {
          try {
            await supabase.rpc('handle_referral_signup_improved', {
              new_user_id: session.user.id,
              referral_code_param: refCode
            });
            console.log('Referral code processed during OAuth:', refCode);
          } catch (error) {
            console.error('Error processing referral during OAuth:', error);
          }
        }

        // Check if this is a new user (no profile or incomplete profile)
        const isNewUser = !profile || !profile.name;
        
        // If user has no profile or incomplete profile, go to progressive auth
        if (isNewUser) {
          navigate('/auth/progressive?step=1');
          return;
        }

        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${session.user.id}`);
        
        if (!hasSeenOnboarding) {
          // New user who hasn't seen onboarding - redirect to onboarding page
          navigate('/onboarding');
          return;
        }

        // User is complete and has seen onboarding, redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yeild-yellow" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
