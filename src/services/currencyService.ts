
export class CurrencyService {
  private static instance: CurrencyService;
  private readonly exchangeRate = 1000; // 1000 points = $1 USD

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public pointsToUSD(points: number): string {
    const usdValue = points / this.exchangeRate;
    return usdValue.toFixed(2);
  }

  public usdToPoints(usd: number): number {
    return Math.round(usd * this.exchangeRate);
  }

  public formatPoints(points: number): string {
    return points.toLocaleString();
  }

  public formatUSD(usd: number): string {
    return `$${usd.toFixed(2)}`;
  }

  public getExchangeRate(): number {
    return this.exchangeRate;
  }

  public calculateNetAmount(grossAmount: number, feePercent: number): number {
    const fee = Math.ceil(grossAmount * (feePercent / 100));
    return grossAmount - fee;
  }

  public calculateProcessingFee(amount: number, feePercent: number): number {
    return Math.ceil(amount * (feePercent / 100));
  }
}

export const currencyService = CurrencyService.getInstance();
