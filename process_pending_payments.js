// Temporary script to process pending payments
import { supabase } from "./src/integrations/supabase/client.js";

async function processPendingPayments() {
  try {
    console.log('Processing pending brand payments...');
    
    const { data, error } = await supabase.functions.invoke('reconcile-brand-payments', {
      body: {
        dry_run: false,
        limit: 10
      }
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Reconciliation result:', data);
  } catch (err) {
    console.error('Failed to process payments:', err);
  }
}

processPendingPayments();