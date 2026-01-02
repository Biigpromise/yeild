import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ModeState {
  currentMode: 'user' | 'brand';
  hasUserProfile: boolean;
  hasBrandProfile: boolean;
  hasUserRole: boolean;
  hasBrandRole: boolean;
  loading: boolean;
}

export const useModeSwitch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<ModeState>({
    currentMode: 'user',
    hasUserProfile: false,
    hasBrandProfile: false,
    hasUserRole: false,
    hasBrandRole: false,
    loading: true,
  });
  
  const [showBrandSetup, setShowBrandSetup] = useState(false);
  const [showUserSetup, setShowUserSetup] = useState(false);

  // Determine current mode based on route
  useEffect(() => {
    const isBrandRoute = location.pathname.startsWith('/brand');
    setState(prev => ({
      ...prev,
      currentMode: isBrandRoute ? 'brand' : 'user'
    }));
  }, [location.pathname]);

  // Check profiles and roles
  const checkProfiles = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Check for user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // Check for brand profile
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Check roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const userRoles = roles?.map(r => r.role) || [];

      setState(prev => ({
        ...prev,
        hasUserProfile: !!userProfile,
        hasBrandProfile: !!brandProfile,
        hasUserRole: userRoles.includes('user'),
        hasBrandRole: userRoles.includes('brand'),
        loading: false,
      }));
    } catch (error) {
      console.error('Error checking profiles:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkProfiles();
  }, [checkProfiles]);

  const switchToBrandMode = async () => {
    if (!user) return;

    // Check if brand profile exists
    if (!state.hasBrandProfile) {
      setShowBrandSetup(true);
      return;
    }

    // Ensure brand role exists
    if (!state.hasBrandRole) {
      await supabase.rpc('add_user_role_if_not_exists', {
        p_user_id: user.id,
        p_role: 'brand'
      });
    }

    navigate('/brand-dashboard');
  };

  const switchToUserMode = async () => {
    if (!user) return;

    // Check if user profile exists
    if (!state.hasUserProfile) {
      setShowUserSetup(true);
      return;
    }

    // Ensure user role exists
    if (!state.hasUserRole) {
      await supabase.rpc('add_user_role_if_not_exists', {
        p_user_id: user.id,
        p_role: 'user'
      });
    }

    navigate('/dashboard');
  };

  const onBrandProfileCreated = async () => {
    setShowBrandSetup(false);
    await checkProfiles();
    navigate('/brand-dashboard');
  };

  const onUserProfileCreated = async () => {
    setShowUserSetup(false);
    await checkProfiles();
    navigate('/dashboard');
  };

  return {
    ...state,
    showBrandSetup,
    showUserSetup,
    setShowBrandSetup,
    setShowUserSetup,
    switchToBrandMode,
    switchToUserMode,
    onBrandProfileCreated,
    onUserProfileCreated,
    refreshProfiles: checkProfiles,
  };
};
