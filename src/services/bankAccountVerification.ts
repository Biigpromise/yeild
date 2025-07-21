
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BankAccountVerificationResult {
  success: boolean;
  accountName?: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  error?: string;
}

export interface SavedBankAccount {
  id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string,
  bankName: string
): Promise<BankAccountVerificationResult> {
  try {
    // Call Flutterwave account verification endpoint
    const response = await supabase.functions.invoke('verify-bank-account', {
      body: {
        account_number: accountNumber,
        account_bank: bankCode
      }
    });

    if (response.error) {
      console.error('Bank verification error:', response.error);
      return {
        success: false,
        accountNumber,
        bankCode,
        bankName,
        error: response.error.message || 'Account verification failed'
      };
    }

    const { data } = response;

    if (data.success && data.account_name) {
      return {
        success: true,
        accountName: data.account_name,
        accountNumber,
        bankCode,
        bankName
      };
    } else {
      return {
        success: false,
        accountNumber,
        bankCode,
        bankName,
        error: data.message || 'Could not verify account'
      };
    }
  } catch (error) {
    console.error('Bank verification error:', error);
    return {
      success: false,
      accountNumber,
      bankCode,
      bankName,
      error: 'Network error during verification'
    };
  }
}

export async function saveBankAccount(
  accountData: Omit<SavedBankAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SavedBankAccount | null> {
  try {
    const { data, error } = await supabase
      .from('saved_bank_accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) {
      console.error('Error saving bank account:', error);
      toast.error('Failed to save bank account');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving bank account:', error);
    toast.error('Failed to save bank account');
    return null;
  }
}

export async function getUserBankAccounts(userId: string): Promise<SavedBankAccount[]> {
  try {
    const { data, error } = await supabase
      .from('saved_bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
}

export async function setDefaultBankAccount(
  userId: string,
  accountId: string
): Promise<boolean> {
  try {
    // First, unset all defaults for this user
    await supabase
      .from('saved_bank_accounts')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the selected account as default
    const { error } = await supabase
      .from('saved_bank_accounts')
      .update({ is_default: true })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to set default account');
      return false;
    }

    toast.success('Default account updated successfully');
    return true;
  } catch (error) {
    console.error('Error setting default account:', error);
    toast.error('Failed to set default account');
    return false;
  }
}

export async function deleteBankAccount(accountId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_bank_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to delete bank account');
      return false;
    }

    toast.success('Bank account deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting bank account:', error);
    toast.error('Failed to delete bank account');
    return false;
  }
}
