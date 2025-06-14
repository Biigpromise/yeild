
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to USD
  withdrawalMethods: string[];
}

export interface SupportedCountry {
  code: string;
  name: string;
  currency: CurrencyRate;
  paymentProvider: 'paystack' | 'stripe' | 'paypal';
}

class CurrencyService {
  private static instance: CurrencyService;
  private exchangeRates: Map<string, CurrencyRate> = new Map();

  constructor() {
    this.initializeRates();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private initializeRates() {
    // Base rates - these would typically come from an API
    const rates: CurrencyRate[] = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        rate: 1, // Base currency
        withdrawalMethods: ['paypal', 'bank_transfer', 'crypto']
      },
      {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        rate: 1650, // 1 USD = 1650 NGN (approximate)
        withdrawalMethods: ['bank_transfer', 'mobile_money']
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        rate: 0.92, // 1 USD = 0.92 EUR
        withdrawalMethods: ['paypal', 'bank_transfer', 'sepa']
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        rate: 0.79, // 1 USD = 0.79 GBP
        withdrawalMethods: ['paypal', 'bank_transfer']
      },
      {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        rate: 129, // 1 USD = 129 KES
        withdrawalMethods: ['mpesa', 'bank_transfer']
      },
      {
        code: 'ZAR',
        name: 'South African Rand',
        symbol: 'R',
        rate: 18.5, // 1 USD = 18.5 ZAR
        withdrawalMethods: ['bank_transfer', 'crypto']
      }
    ];

    rates.forEach(rate => {
      this.exchangeRates.set(rate.code, rate);
    });
  }

  getSupportedCountries(): SupportedCountry[] {
    return [
      {
        code: 'NG',
        name: 'Nigeria',
        currency: this.exchangeRates.get('NGN')!,
        paymentProvider: 'paystack'
      },
      {
        code: 'US',
        name: 'United States',
        currency: this.exchangeRates.get('USD')!,
        paymentProvider: 'stripe'
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        currency: this.exchangeRates.get('GBP')!,
        paymentProvider: 'stripe'
      },
      {
        code: 'DE',
        name: 'Germany',
        currency: this.exchangeRates.get('EUR')!,
        paymentProvider: 'stripe'
      },
      {
        code: 'KE',
        name: 'Kenya',
        currency: this.exchangeRates.get('KES')!,
        paymentProvider: 'paystack'
      },
      {
        code: 'ZA',
        name: 'South Africa',
        currency: this.exchangeRates.get('ZAR')!,
        paymentProvider: 'paystack'
      }
    ];
  }

  convertUSDToLocal(usdAmount: number, currencyCode: string): number {
    const rate = this.exchangeRates.get(currencyCode);
    if (!rate) throw new Error(`Currency ${currencyCode} not supported`);
    return Math.round(usdAmount * rate.rate * 100) / 100;
  }

  convertLocalToUSD(localAmount: number, currencyCode: string): number {
    const rate = this.exchangeRates.get(currencyCode);
    if (!rate) throw new Error(`Currency ${currencyCode} not supported`);
    return Math.round((localAmount / rate.rate) * 100) / 100;
  }

  formatCurrency(amount: number, currencyCode: string): string {
    const rate = this.exchangeRates.get(currencyCode);
    if (!rate) return `$${amount.toFixed(2)}`;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'NGN' || currencyCode === 'KES' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'NGN' || currencyCode === 'KES' ? 0 : 2,
    }).format(amount);
  }

  getCurrencyInfo(currencyCode: string): CurrencyRate | undefined {
    return this.exchangeRates.get(currencyCode);
  }

  getUserCountryFromIP(): Promise<string> {
    // This would typically use a geolocation service
    // For now, we'll default to Nigeria since that's your primary market
    return Promise.resolve('NG');
  }

  // Points to USD conversion (1000 points = $1 USD)
  pointsToUSD(points: number): number {
    return points / 1000;
  }

  usdToPoints(usd: number): number {
    return Math.floor(usd * 1000);
  }

  pointsToLocalCurrency(points: number, currencyCode: string): number {
    const usd = this.pointsToUSD(points);
    return this.convertUSDToLocal(usd, currencyCode);
  }

  localCurrencyToPoints(amount: number, currencyCode: string): number {
    const usd = this.convertLocalToUSD(amount, currencyCode);
    return this.usdToPoints(usd);
  }
}

export const currencyService = CurrencyService.getInstance();
