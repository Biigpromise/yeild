
// Analytics service for Google Analytics 4 and Google Tag Manager
export interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  user_id?: string;
  user_type?: 'user' | 'brand';
  custom_parameters?: Record<string, any>;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.isInitialized = true;
      console.log('Analytics initialized successfully');
    } else {
      console.warn('Google Analytics not loaded');
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, event not tracked:', event);
      return;
    }

    const eventData: Record<string, any> = {
      event_category: event.event_category,
      event_label: event.event_label,
      value: event.value,
      user_id: event.user_id,
      user_type: event.user_type,
      ...event.custom_parameters
    };

    // Remove undefined values
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined) {
        delete eventData[key];
      }
    });

    window.gtag('event', event.event_name, eventData);
    console.log('Analytics event tracked:', event.event_name, eventData);
  }

  // Authentication Events
  trackSignup(userId: string, userType: 'user' | 'brand', method: 'email' | 'google') {
    this.trackEvent({
      event_name: 'sign_up',
      event_category: 'authentication',
      event_label: method,
      user_id: userId,
      user_type: userType,
      custom_parameters: {
        method: method,
        signup_type: userType
      }
    });
  }

  trackLogin(userId: string, userType: 'user' | 'brand', method: 'email' | 'google') {
    this.trackEvent({
      event_name: 'login',
      event_category: 'authentication',
      event_label: method,
      user_id: userId,
      user_type: userType,
      custom_parameters: {
        method: method,
        login_type: userType
      }
    });
  }

  trackLogout(userId: string, userType: 'user' | 'brand') {
    this.trackEvent({
      event_name: 'logout',
      event_category: 'authentication',
      user_id: userId,
      user_type: userType
    });
  }

  // User Engagement Events
  trackPageView(pageName: string, userId?: string, userType?: 'user' | 'brand') {
    this.trackEvent({
      event_name: 'page_view',
      event_category: 'engagement',
      event_label: pageName,
      user_id: userId,
      user_type: userType,
      custom_parameters: {
        page_name: pageName
      }
    });
  }

  trackTaskCompletion(userId: string, taskId: string, reward: number) {
    this.trackEvent({
      event_name: 'task_complete',
      event_category: 'engagement',
      event_label: 'task_completion',
      value: reward,
      user_id: userId,
      user_type: 'user',
      custom_parameters: {
        task_id: taskId,
        reward_amount: reward
      }
    });
  }

  trackSocialInteraction(userId: string, interactionType: 'like' | 'comment' | 'share', contentId: string) {
    this.trackEvent({
      event_name: 'social_interaction',
      event_category: 'engagement',
      event_label: interactionType,
      user_id: userId,
      custom_parameters: {
        interaction_type: interactionType,
        content_id: contentId
      }
    });
  }

  // Business Events
  trackEarning(userId: string, amount: number, source: string) {
    this.trackEvent({
      event_name: 'earn_virtual_currency',
      event_category: 'monetization',
      event_label: source,
      value: amount,
      user_id: userId,
      user_type: 'user',
      custom_parameters: {
        virtual_currency_name: 'YEILD_POINTS',
        source: source
      }
    });
  }

  trackWithdrawal(userId: string, amount: number, method: string) {
    this.trackEvent({
      event_name: 'spend_virtual_currency',
      event_category: 'monetization',
      event_label: method,
      value: amount,
      user_id: userId,
      user_type: 'user',
      custom_parameters: {
        virtual_currency_name: 'YEILD_POINTS',
        withdrawal_method: method
      }
    });
  }

  // Brand Events
  trackBrandCampaignCreation(userId: string, campaignId: string, budget: number) {
    this.trackEvent({
      event_name: 'create_campaign',
      event_category: 'brand_actions',
      event_label: 'campaign_creation',
      value: budget,
      user_id: userId,
      user_type: 'brand',
      custom_parameters: {
        campaign_id: campaignId,
        budget: budget
      }
    });
  }

  // Set user properties
  setUserProperties(userId: string, properties: Record<string, any>) {
    if (!this.isInitialized) return;

    window.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
      custom_map: properties
    });
  }

  // Enhanced ecommerce tracking
  trackPurchase(userId: string, transactionId: string, value: number, items: any[]) {
    this.trackEvent({
      event_name: 'purchase',
      event_category: 'ecommerce',
      value: value,
      user_id: userId,
      custom_parameters: {
        transaction_id: transactionId,
        currency: 'USD',
        items: items
      }
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
