
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback');
        console.log('AuthCallback: Current URL:', window.location.href);
        console.log('AuthCallback: Search params:', Object.fromEntries(searchParams.entries()));
        
        // Check for OAuth error in URL params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('OAuth error in URL:', error, errorDescription);
          
          if (error === 'access_denied') {
            toast.error('Google sign-in was cancelled. Please try again.');
          } else if (error === 'unauthorized_client') {
            toast.error('Google OAuth configuration error. Please check your settings.');
          } else {
            toast.error(`OAuth error: ${errorDescription || error}`);
          }
          
          navigate('/signup?error=oauth_failed');
          return;
        }
        
        // Get the session after OAuth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback session error:', sessionError);
          toast.error('Authentication failed. Please try again.');
          navigate('/signup?error=callback_failed');
          return;
        }

        if (!session) {
          console.log('No session found after OAuth callback, redirecting to signup');
          toast.error('Authentication session not found. Please try again.');
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
          userId: session.user.id,
          email: session.user.email
        });

        // Handle referral code if present
        if (refCode && session.user) {
          try {
            await supabase.rpc('handle_referral_signup', {
              new_user_id: session.user.id,
              referral_code_param: refCode
            });
            console.log('Referral code processed:', refCode);
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
          }
        }

        // Check if user has completed profile setup
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        // Check user roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          console.error('Error fetching user roles:', roleError);
        }

        const userRoles = roleData?.map(r => r.role) || [];
        console.log('User roles after OAuth:', userRoles);

        // Check for admin access
        if (session.user.email === 'yeildsocials@gmail.com' || userRoles.includes('admin')) {
          console.log('Redirecting to admin dashboard');
          toast.success('Welcome back, admin!');
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
            toast.success('Welcome back to your brand dashboard!');
            navigate('/brand-dashboard');
          } else {
            toast.success('Welcome! Please complete your brand profile.');
            navigate('/brand-signup');
          }
          return;
        }

        // For regular users - check if they need to complete onboarding
        if (!profile || !profile.name) {
          console.log('User needs to complete profile, redirecting to progressive auth');
          toast.success('Welcome! Please complete your profile.');
          navigate('/auth/progressive?step=1');
          return;
        }

        // User is complete, redirect to dashboard
        console.log('User profile complete, redirecting to dashboard');
        toast.success('Welcome back!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast.error('An unexpected error occurred during authentication.');
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
