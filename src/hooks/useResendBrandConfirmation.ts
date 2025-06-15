
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useResendBrandConfirmation() {
  const [resendLoading, setResendLoading] = useState(false);

  const resend = useCallback(async (email?: string | null, companyName?: string | null) => {
    if (!email || !companyName) {
      toast.error('Missing application context, please refresh and try again.');
      return false;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-brand-confirmation-email', {
        body: { email, companyName },
      });
      if (error) throw error;
      toast.success('Confirmation email sent! Please check your inbox.');
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to resend confirmation email', err);
      toast.error('Failed to resend confirmation email. Please try again shortly.');
      return false;
    } finally {
      setResendLoading(false);
    }
  }, []);

  return { resend, resendLoading };
}
