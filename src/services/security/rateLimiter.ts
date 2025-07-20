
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static limits = new Map<string, RateLimitEntry>();
  
  static isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (entry.count >= maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }
  
  static getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    
    return Math.max(0, entry.resetTime - Date.now());
  }
  
  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Cleanup expired entries every 5 minutes
setInterval(() => RateLimiter.cleanup(), 5 * 60 * 1000);
