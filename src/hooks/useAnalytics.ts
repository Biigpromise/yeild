
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  const { user } = useAuth();

  // Track page views automatically
  useEffect(() => {
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'home' : currentPath.replace('/', '');
    
    analytics.trackPageView(pageName, user?.id, user?.user_metadata?.user_type);
  }, [user]);

  return {
    trackSignup: (userType: 'user' | 'brand', method: 'email' | 'google') => {
      if (user) {
        analytics.trackSignup(user.id, userType, method);
      }
    },
    trackLogin: (userType: 'user' | 'brand', method: 'email' | 'google') => {
      if (user) {
        analytics.trackLogin(user.id, userType, method);
      }
    },
    trackLogout: (userType: 'user' | 'brand') => {
      if (user) {
        analytics.trackLogout(user.id, userType);
      }
    },
    trackTaskCompletion: (taskId: string, reward: number) => {
      if (user) {
        analytics.trackTaskCompletion(user.id, taskId, reward);
      }
    },
    trackSocialInteraction: (interactionType: 'like' | 'comment' | 'share', contentId: string) => {
      if (user) {
        analytics.trackSocialInteraction(user.id, interactionType, contentId);
      }
    },
    trackEarning: (amount: number, source: string) => {
      if (user) {
        analytics.trackEarning(user.id, amount, source);
      }
    },
    trackWithdrawal: (amount: number, method: string) => {
      if (user) {
        analytics.trackWithdrawal(user.id, amount, method);
      }
    },
    trackBrandCampaignCreation: (campaignId: string, budget: number) => {
      if (user) {
        analytics.trackBrandCampaignCreation(user.id, campaignId, budget);
      }
    },
    setUserProperties: (properties: Record<string, any>) => {
      if (user) {
        analytics.setUserProperties(user.id, properties);
      }
    }
  };
};
