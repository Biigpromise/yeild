
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WithdrawalRequest } from "./types";
import { processInstantUserPayment, bulkProcessUserPayments } from './userPaymentService';

// Process withdrawal request with instant payment
export async function processWithdrawalRequest(
  requestId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<boolean> {
  try {
    if (action === 'reject') {
      // Simple rejection
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('Withdrawal request rejected');
      return true;
    } else {
      // Approval with instant payment
      const { data: request, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        console.error('Error fetching withdrawal request:', fetchError);
        toast.error('Failed to fetch withdrawal request');
        return false;
      }

      // Process instant payment
      const paymentResult = await processInstantUserPayment({
        userId: request.user_id,
        amount: request.amount,
        payoutMethod: request.payout_method,
        payoutDetails: request.payout_details,
        description: `Admin approved payout - ${requestId}`
      });

      if (paymentResult.status === 'success') {
        toast.success('Withdrawal approved and payment processed instantly');
        return true;
      } else {
        toast.error(`Payment failed: ${paymentResult.message}`);
        return false;
      }
    }
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    toast.error('Failed to process withdrawal request');
    return false;
  }
}

// Get all withdrawal requests with real data
export async function getWithdrawalRequests(filters?: {
  status?: string;
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  paymentMethod?: string;
}): Promise<WithdrawalRequest[]> {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select(`
        *,
        profiles(name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }

    if (filters?.paymentMethod) {
      query = query.eq('payout_method', filters.paymentMethod);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const userIds = [...new Set((data || []).map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return (data || []).map(request => ({
      id: request.id,
      userId: request.user_id,
      userName: profileMap.get(request.user_id)?.name || 'Unknown User',
      amount: request.amount,
      payoutMethod: request.payout_method,
      status: request.status as 'pending' | 'approved' | 'rejected' | 'processed',
      requestedAt: request.created_at,
      processedAt: request.processed_at,
      payoutDetails: request.payout_details,
      adminNotes: request.admin_notes
    }));
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return [];
  }
}

// Bulk process withdrawal requests with instant payments
export async function bulkProcessWithdrawals(
  requestIds: string[],
  action: 'approve' | 'reject',
  notes?: string
): Promise<boolean> {
  try {
    if (action === 'reject') {
      // Bulk rejection
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: notes
        })
        .in('id', requestIds);

      if (error) throw error;
      toast.success(`Bulk rejection completed for ${requestIds.length} requests`);
      return true;
    } else {
      // Bulk approval with instant payments
      const results = await bulkProcessUserPayments(requestIds);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} payments processed successfully`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} payments failed`);
      }

      return successCount === results.length;
    }
  } catch (error) {
    console.error('Error bulk processing withdrawals:', error);
    toast.error('Failed to bulk process withdrawals');
    return false;
  }
}
