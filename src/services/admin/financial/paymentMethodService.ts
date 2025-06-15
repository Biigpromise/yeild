
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethodConfig } from "./types";

export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    const { data, error } = await supabase
      .from('payment_method_configs')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error("Failed to fetch payment methods.");
      throw error;
    }

    return data.map(d => ({
      id: d.id,
      methodKey: d.method_key,
      name: d.name,
      enabled: d.enabled,
      minAmount: d.min_amount,
      maxAmount: d.max_amount,
      processingFeePercent: d.processing_fee_percent,
      processingTimeEstimate: d.processing_time_estimate,
      configurationDetails: d.configuration_details,
    }));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    toast.error('Failed to fetch payment methods.');
    return [];
  }
}

export async function updatePaymentMethod(
  methodId: string,
  updates: Partial<Omit<PaymentMethodConfig, 'id'>>
): Promise<boolean> {
  try {
    const updateData: { [key: string]: any } = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.methodKey !== undefined) updateData.method_key = updates.methodKey;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.minAmount !== undefined) updateData.min_amount = updates.minAmount;
    if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
    if (updates.processingFeePercent !== undefined) updateData.processing_fee_percent = updates.processingFeePercent;
    if (updates.processingTimeEstimate !== undefined) updateData.processing_time_estimate = updates.processingTimeEstimate;
    if (updates.configurationDetails !== undefined) updateData.configuration_details = updates.configurationDetails;

    const { error } = await supabase
      .from('payment_method_configs')
      .update(updateData)
      .eq('id', methodId);

    if (error) {
      throw error;
    }
    
    toast.success('Payment method updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating payment method:', error);
    toast.error('Failed to update payment method');
    return false;
  }
}
