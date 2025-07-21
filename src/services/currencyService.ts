
export const currencyService = {
  pointsToUSD(points: number): number {
    // Conversion rate: 100 points = $1 USD
    return points / 100;
  },

  usdToPoints(usd: number): number {
    // Conversion rate: $1 USD = 100 points
    return usd * 100;
  },

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatPoints(points: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(points);
  }
};
