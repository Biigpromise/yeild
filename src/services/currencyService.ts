/**
 * Currency Service - NGN-native (1 point = ₦1)
 *
 * Points are a 1:1 mirror of Naira for display/gamification purposes.
 * Execution-order payouts use NGN directly (see campaignPricingService).
 * USD conversion is derived for international display only.
 */

const USD_TO_NGN_RATE = 1500; // Approximate; update as needed or pull from currency_rates table

export const currencyService = {
  // 1 point = ₦1
  pointsToNGN(points: number): number {
    return points;
  },

  ngnToPoints(ngn: number): number {
    return ngn;
  },

  // Derived USD conversion (display only)
  pointsToUSD(points: number): number {
    return points / USD_TO_NGN_RATE;
  },

  usdToPoints(usd: number): number {
    return usd * USD_TO_NGN_RATE;
  },

  formatNGN(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatCurrency(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
      maximumFractionDigits: currency === 'NGN' ? 0 : 2
    }).format(amount);
  },

  formatPoints(points: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(points);
  }
};
