
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { analytics } from '@/services/analytics';

export const AnalyticsIntegration: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { trackAuthAction } = useAnalyticsTracking();

  // Initialize analytics
  useEffect(() => {
    analytics.init();
  }, []);

  // Track authentication state changes
  useEffect(() => {
    if (user) {
      // User logged in - track login event
      trackAuthAction('login');
    }
  }, [user, trackAuthAction]);

  // Track page views on route changes
  useEffect(() => {
    const pageName = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    analytics.trackPageView(pageName, user?.id, user?.user_metadata?.user_type);
  }, [location, user]);

  // Set user properties when user changes
  useEffect(() => {
    if (user) {
      analytics.setUserProperties(user.id, {
        user_type: user.user_metadata?.user_type || 'user',
        signup_date: user.created_at,
        email_verified: user.email_confirmed_at ? true : false,
        last_login: new Date().toISOString()
      });
    }
  }, [user]);

  return null; // This component doesn't render anything
};
