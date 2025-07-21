
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/analytics';
import { useLocation } from 'react-router-dom';

export const AnalyticsIntegration: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Initialize analytics when user changes
  useEffect(() => {
    if (user) {
      analytics.setUserProperties(user.id, {
        user_type: user.user_metadata?.user_type || 'user',
        signup_date: user.created_at,
        email_verified: user.email_confirmed_at ? true : false
      });
    }
  }, [user]);

  // Track page views on route changes
  useEffect(() => {
    const pageName = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    analytics.trackPageView(pageName, user?.id, user?.user_metadata?.user_type);
  }, [location, user]);

  return null; // This component doesn't render anything
};
