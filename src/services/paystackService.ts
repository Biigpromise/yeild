
import { supabase } from "@/integrations/supabase/client";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

class PaystackService {
  private baseURL = 'https://api.paystack.co';
  
  async initializePayment(email: string, amount: number, reference?: string) {
    try {
      const { data } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email,
          amount: amount * 100, // Convert to kobo (smallest unit)
          currency: 'NGN',
          reference,
          callback_url: `${window.location.origin}/payment-success`
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error initializing Paystack payment:', error);
      throw error;
    }
  }
  
  async verifyPayment(reference: string) {
    try {
      const { data } = await supabase.functions.invoke('paystack-verify', {
        body: { reference }
      });
      
      return data;
    } catch (error) {
      console.error('Error verifying Paystack payment:', error);
      throw error;
    }
  }
  
  // Nigerian banks list for bank transfer options
  getNigerianBanks() {
    return [
      { name: 'Access Bank', code: '044' },
      { name: 'Citibank Nigeria', code: '023' },
      { name: 'Ecobank Nigeria', code: '050' },
      { name: 'Fidelity Bank', code: '070' },
      { name: 'First Bank of Nigeria', code: '011' },
      { name: 'First City Monument Bank', code: '214' },
      { name: 'Guaranty Trust Bank', code: '058' },
      { name: 'Heritage Bank', code: '030' },
      { name: 'Keystone Bank', code: '082' },
      { name: 'Polaris Bank', code: '076' },
      { name: 'Providus Bank', code: '101' },
      { name: 'Stanbic IBTC Bank', code: '221' },
      { name: 'Standard Chartered Bank', code: '068' },
      { name: 'Sterling Bank', code: '232' },
      { name: 'Union Bank of Nigeria', code: '032' },
      { name: 'United Bank For Africa', code: '033' },
      { name: 'Unity Bank', code: '215' },
      { name: 'Wema Bank', code: '035' },
      { name: 'Zenith Bank', code: '057' },
    ];
  }
  
  formatNaira(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export const paystackService = new PaystackService();
