
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
        console.log('AuthCallback: Processing OAuth callback');
        
        // Get the session after OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/signup?error=callback_failed');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to signup');
          navigate('/signup');
          return;
        }

        // Get user type and next path from query params
        const userType = searchParams.get('user_type') || 'user';
        const next = searchParams.get('next');
        const refCode = searchParams.get('ref');

        console.log('OAuth callback successful:', {
          userType,
          next,
          refCode,
          userId: session.user.id
        });

        // Handle referral code if present
        if (refCode && session.user) {
          try {
            await supabase.rpc('handle_referral_signup', {
              new_user_id: session.user.id,
              referral_code_param: refCode
            });
            console.log('Referral code processed:', refCode);
          } catch (error) {
            console.error('Error processing referral:', error);
          }
        }

        // Check if user has completed profile setup
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
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
          return;
        }

        // Check for brand role or brand signup
        if (userRoles.includes('brand') || userType === 'brand') {
          console.log('Redirecting to brand dashboard/signup');
          
          // Check if user has brand application or profile
          const { data: brandApp } = await supabase
            .from('brand_applications')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          const { data: brandProfile } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (brandApp || brandProfile) {
            navigate('/brand-dashboard');
          } else {
            navigate('/brand-signup');
          }
          return;
        }

        // For regular users - check if they need to complete onboarding
        if (!profile || !profile.name || !profile.username) {
          console.log('User needs to complete profile, redirecting to progressive auth');
          navigate('/auth/progressive?step=1');
          return;
        }

        // User is complete, redirect to dashboard
        console.log('User profile complete, redirecting to dashboard');
        navigate('/dashboard');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/signup?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
