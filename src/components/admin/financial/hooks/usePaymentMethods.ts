
import { useState, useEffect, useCallback } from 'react';
import { adminFinancialService, PaymentMethodConfig } from "@/services/admin/adminFinancialService";
import { toast } from "sonner";

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    try {
      const methods = await adminFinancialService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const updateMethod = async (method: PaymentMethodConfig) => {
    try {
      const { id, ...updateData } = method;
      const success = await adminFinancialService.updatePaymentMethod(
        id, 
        updateData
      );
      if (success) {
        await loadPaymentMethods();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method.');
      return false;
    }
  };

  return {
    paymentMethods,
    loading,
    loadPaymentMethods,
    updateMethod,
  };
};
