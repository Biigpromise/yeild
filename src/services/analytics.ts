
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const analytics = {
  // Initialize GA4 with the actual measurement ID
  init: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-E8XEF9FWZR', {
        page_title: 'YEILD Social Platform',
        page_location: window.location.href,
        send_page_view: true,
        custom_map: {
          'custom_parameter_1': 'user_type',
          'custom_parameter_2': 'user_tier'
        }
      });
    }
  },

  // Track page views
  trackPageView: (pageName: string, userId?: string, userType?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        user_id: userId,
        custom_parameter_1: userType || 'unknown'
      });
    }
  },

  // Track custom events
  trackEvent: (eventData: {
    event_name: string;
    event_category?: string;
    event_label?: string;
    value?: number;
    user_id?: string;
    [key: string]: any;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventData.event_name, {
        event_category: eventData.event_category,
        event_label: eventData.event_label,
        value: eventData.value,
        user_id: eventData.user_id,
        ...eventData
      });
    }
  },

  // Track user signup
  trackSignup: (userId: string, userType: 'user' | 'brand', method: 'email' | 'google') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
        user_id: userId,
        custom_parameter_1: userType
      });
    }
  },

  // Track user login
  trackLogin: (userId: string, userType: 'user' | 'brand', method: 'email' | 'google') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method,
        user_id: userId,
        custom_parameter_1: userType
      });
    }
  },

  // Track user logout
  trackLogout: (userId: string, userType: 'user' | 'brand') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'logout', {
        user_id: userId,
        custom_parameter_1: userType
      });
    }
  },

  // Track task completion
  trackTaskCompletion: (userId: string, taskId: string, reward: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'task_completion', {
        event_category: 'engagement',
        event_label: taskId,
        value: reward,
        user_id: userId
      });
    }
  },

  // Track social interactions
  trackSocialInteraction: (userId: string, interactionType: 'like' | 'comment' | 'share', contentId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'social_interaction', {
        event_category: 'social',
        event_label: `${interactionType}_${contentId}`,
        interaction_type: interactionType,
        content_id: contentId,
        user_id: userId
      });
    }
  },

  // Track earnings
  trackEarning: (userId: string, amount: number, source: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'earn_virtual_currency', {
        virtual_currency_name: 'points',
        value: amount,
        event_category: 'monetization',
        event_label: source,
        user_id: userId
      });
    }
  },

  // Track withdrawals
  trackWithdrawal: (userId: string, amount: number, method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'withdrawal_request', {
        event_category: 'monetization',
        event_label: method,
        value: amount,
        user_id: userId
      });
    }
  },

  // Track brand campaign creation
  trackBrandCampaignCreation: (userId: string, campaignId: string, budget: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'campaign_creation', {
        event_category: 'brand_activity',
        event_label: campaignId,
        value: budget,
        user_id: userId
      });
    }
  },

  // Set user properties
  setUserProperties: (userId: string, properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-E8XEF9FWZR', {
        user_id: userId,
        user_properties: properties
      });
    }
  }
};
