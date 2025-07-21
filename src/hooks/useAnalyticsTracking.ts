
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics';

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Track page views automatically
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

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    if (!user) return;
    
    analytics.trackEvent({
      event_name: action,
      event_category: 'user_action',
      user_id: user.id,
      ...properties
    });
  }, [user]);

  const trackTaskCompletion = useCallback((taskId: string, reward: number, taskType?: string) => {
    if (!user) return;
    
    analytics.trackTaskCompletion(user.id, taskId, reward);
    
    // Also track as custom event for more detailed analysis
    analytics.trackEvent({
      event_name: 'task_completed',
      event_category: 'engagement',
      event_label: taskType || 'unknown',
      task_id: taskId,
      reward_amount: reward,
      user_id: user.id
    });
  }, [user]);

  const trackSocialInteraction = useCallback((type: 'like' | 'comment' | 'share', contentId: string, contentType?: string) => {
    if (!user) return;
    
    analytics.trackSocialInteraction(user.id, type, contentId);
    
    // Enhanced tracking with more context
    analytics.trackEvent({
      event_name: 'social_interaction',
      event_category: 'social',
      event_label: `${type}_${contentType || 'post'}`,
      interaction_type: type,
      content_id: contentId,
      content_type: contentType || 'post',
      user_id: user.id
    });
  }, [user]);

  const trackEarning = useCallback((amount: number, source: string, details?: Record<string, any>) => {
    if (!user) return;
    
    analytics.trackEarning(user.id, amount, source);
    
    // Enhanced earning tracking
    analytics.trackEvent({
      event_name: 'points_earned',
      event_category: 'monetization',
      event_label: source,
      value: amount,
      earning_source: source,
      user_id: user.id,
      ...details
    });
  }, [user]);

  const trackWithdrawal = useCallback((amount: number, method: string, status?: string) => {
    if (!user) return;
    
    analytics.trackWithdrawal(user.id, amount, method);
    
    // Enhanced withdrawal tracking
    analytics.trackEvent({
      event_name: 'withdrawal_initiated',
      event_category: 'monetization',
      event_label: method,
      value: amount,
      withdrawal_method: method,
      withdrawal_status: status || 'initiated',
      user_id: user.id
    });
  }, [user]);

  const trackBrandCampaign = useCallback((action: string, campaignId: string, budget?: number, details?: Record<string, any>) => {
    if (!user) return;
    
    if (action === 'create' && budget) {
      analytics.trackBrandCampaignCreation(user.id, campaignId, budget);
    }
    
    // Enhanced campaign tracking
    analytics.trackEvent({
      event_name: `campaign_${action}`,
      event_category: 'brand_activity',
      event_label: campaignId,
      value: budget || 0,
      campaign_id: campaignId,
      action: action,
      user_id: user.id,
      ...details
    });
  }, [user]);

  const trackAuthAction = useCallback((action: 'signup' | 'login' | 'logout', method?: string) => {
    if (!user && action !== 'logout') return;
    
    const userType = user?.user_metadata?.user_type || 'user';
    const authMethod = method || 'email';
    
    switch (action) {
      case 'signup':
        analytics.trackSignup(user!.id, userType as 'user' | 'brand', authMethod as 'email' | 'google');
        break;
      case 'login':
        analytics.trackLogin(user!.id, userType as 'user' | 'brand', authMethod as 'email' | 'google');
        break;
      case 'logout':
        if (user) {
          analytics.trackLogout(user.id, userType as 'user' | 'brand');
        }
        break;
    }
  }, [user]);

  return {
    trackUserAction,
    trackTaskCompletion,
    trackSocialInteraction,
    trackEarning,
    trackWithdrawal,
    trackBrandCampaign,
    trackAuthAction
  };
};
