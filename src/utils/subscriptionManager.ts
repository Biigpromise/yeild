import { supabase } from '@/integrations/supabase/client';

interface SubscriptionManager {
  subscriptions: Map<string, any>;
  subscribe: (key: string, channel: any) => void;
  unsubscribe: (key: string) => void;
  unsubscribeAll: () => void;
}

class ChatSubscriptionManager implements SubscriptionManager {
  subscriptions = new Map<string, any>();

  subscribe(key: string, channel: any) {
    // If a subscription already exists for this key, unsubscribe first
    if (this.subscriptions.has(key)) {
      this.unsubscribe(key);
    }
    
    this.subscriptions.set(key, channel);
    console.log(`✅ Subscribed to: ${key}`);
  }

  unsubscribe(key: string) {
    const channel = this.subscriptions.get(key);
    if (channel) {
      try {
        supabase.removeChannel(channel);
        this.subscriptions.delete(key);
        console.log(`🔌 Unsubscribed from: ${key}`);
      } catch (error) {
        console.warn(`Warning cleaning up subscription ${key}:`, error);
      }
    }
  }

  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key);
    }
  }

  // Get unique channel name to prevent conflicts
  getUniqueChannelName(base: string, userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const userPart = userId ? `_${userId}` : '';
    return `${base}${userPart}_${timestamp}_${random}`;
  }
}

// Export singleton instance
export const subscriptionManager = new ChatSubscriptionManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.unsubscribeAll();
  });
}