
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WithdrawalRequest } from "./types";

// Process withdrawal request with real data
export async function processWithdrawalRequest(
  requestId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      processed_at: new Date().toISOString(),
      admin_notes: notes
    };

    const { error } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) throw error;
    
    toast.success(`Withdrawal request ${action}d successfully`);
    return true;
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
      .order('requested_at', { ascending: false });

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
        .gte('requested_at', filters.dateRange.start.toISOString())
        .lte('requested_at', filters.dateRange.end.toISOString());
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
      requestedAt: request.requested_at,
      processedAt: request.processed_at,
      payoutDetails: request.payout_details,
      adminNotes: request.admin_notes
    }));
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return [];
  }
}

// Bulk process withdrawal requests
export async function bulkProcessWithdrawals(
  requestIds: string[],
  action: 'approve' | 'reject',
  notes?: string
): Promise<boolean> {
  try {
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      processed_at: new Date().toISOString(),
      admin_notes: notes
    };

    const { error } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .in('id', requestIds);

    if (error) throw error;
    
    toast.success(`Bulk ${action} completed for ${requestIds.length} requests`);
    return true;
  } catch (error) {
    console.error('Error bulk processing withdrawals:', error);
    toast.error('Failed to bulk process withdrawals');
    return false;
  }
}
