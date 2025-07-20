import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getFlutterwaveCode } from "./nigerianBanksService";

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  method_type: 'bank_transfer' | 'mobile_money' | 'digital_wallet';
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddPaymentMethodData {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  method_type?: 'bank_transfer' | 'mobile_money' | 'digital_wallet';
}

class PaymentMethodsService {
  async getUserPaymentMethods(userId: string): Promise<UserPaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserPaymentMethod[];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
      return [];
    }
  }

  async addPaymentMethod(userId: string, data: AddPaymentMethodData): Promise<UserPaymentMethod | null> {
    try {
      // Check if this is the first payment method (make it default)
      const existingMethods = await this.getUserPaymentMethods(userId);
      const isFirstMethod = existingMethods.length === 0;

      const { data: newMethod, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: userId,
          method_type: data.method_type || 'bank_transfer',
          bank_code: data.bank_code,
          bank_name: data.bank_name,
          account_number: data.account_number,
          account_name: data.account_name,
          is_default: isFirstMethod
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Payment method added successfully');
      return newMethod as UserPaymentMethod;
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      if (error.code === '23505') {
        toast.error('This payment method already exists');
      } else {
        toast.error('Failed to add payment method');
      }
      return null;
    }
  }

  async updatePaymentMethod(id: string, updates: Partial<AddPaymentMethodData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_payment_methods')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Payment method updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
      return false;
    }
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Payment method removed successfully');
      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to remove payment method');
      return false;
    }
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
    try {
      // First, remove default from all other methods
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected method as default
      const { error } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;

      toast.success('Default payment method updated');
      return true;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
      return false;
    }
  }

  async verifyAccountName(bankCode: string, accountNumber: string): Promise<string | null> {
    try {
      // Use Flutterwave-specific bank code
      const flutterwaveCode = getFlutterwaveCode(bankCode);
      
      console.log('Verifying account with Flutterwave code:', flutterwaveCode);
      
      // Call Flutterwave account verification endpoint
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: {
          account_number: accountNumber,
          account_bank: flutterwaveCode // Use the correct Flutterwave code
        }
      });

      if (error) throw error;

      if (data?.status === 'success' && data?.data?.account_name) {
        return data.data.account_name;
      }

      return null;
    } catch (error) {
      console.error('Error verifying account:', error);
      return null;
    }
  }
}

export const paymentMethodsService = new PaymentMethodsService();
