import { supabase } from '@/integrations/supabase/client';

export interface UserPaymentRequest {
  userId: string;
  amount: number;
  payoutMethod: string;
  payoutDetails: any;
  description?: string;
}

export interface ProcessedPayment {
  id: string;
  status: 'success' | 'failed' | 'insufficient_funds';
  message: string;
  transactionId?: string;
}

/**
 * Instant user payment processing using brand wallet funds (70% portion)
 */
export const processInstantUserPayment = async (
  paymentRequest: UserPaymentRequest
): Promise<ProcessedPayment> => {
  try {
    console.log('Processing instant user payment:', paymentRequest);

    // 1. Get brand wallet to check available balance
    const { data: brandWallet, error: walletError } = await supabase
      .from('brand_wallets')
      .select('*')
      .eq('brand_id', paymentRequest.userId)
      .single();

    if (walletError || !brandWallet) {
      return {
        id: '',
        status: 'failed',
        message: 'Brand wallet not found'
      };
    }

    // 2. Check if sufficient balance exists
    if (brandWallet.balance < paymentRequest.amount) {
      return {
        id: '',
        status: 'insufficient_funds',
        message: `Insufficient balance. Available: ₦${brandWallet.balance.toLocaleString()}, Required: ₦${paymentRequest.amount.toLocaleString()}`
      };
    }

    // 3. Create withdrawal request record
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: paymentRequest.userId,
        amount: paymentRequest.amount,
        payout_method: paymentRequest.payoutMethod,
        payout_details: paymentRequest.payoutDetails,
        status: 'approved' // Auto-approve for instant payments
      })
      .select()
      .single();

    if (requestError || !withdrawalRequest) {
      console.error('Error creating withdrawal request:', requestError);
      return {
        id: '',
        status: 'failed',
        message: 'Failed to create withdrawal request'
      };
    }

    // 4. Process wallet transaction to deduct amount
    const { error: transactionError } = await supabase.rpc('process_wallet_transaction', {
      p_brand_id: paymentRequest.userId,
      p_transaction_type: 'withdrawal',
      p_amount: paymentRequest.amount,
      p_description: paymentRequest.description || `User payout - ${withdrawalRequest.id}`,
      p_reference_id: withdrawalRequest.id,
      p_campaign_id: null,
      p_payment_transaction_id: null
    });

    if (transactionError) {
      console.error('Error processing wallet transaction:', transactionError);
      
      // Update withdrawal request status to failed
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'failed' })
        .eq('id', withdrawalRequest.id);

      return {
        id: withdrawalRequest.id,
        status: 'failed',
        message: 'Failed to process wallet transaction'
      };
    }

    // 5. Initiate actual payout (Flutterwave transfer)
    const transferResult = await initiateFlutterwaveTransfer({
      amount: paymentRequest.amount,
      accountNumber: paymentRequest.payoutDetails.accountNumber,
      accountBank: paymentRequest.payoutDetails.bankCode,
      beneficiaryName: paymentRequest.payoutDetails.accountName,
      reference: `USER-PAYOUT-${withdrawalRequest.id}`,
      narration: paymentRequest.description || 'User earning payout'
    });

    if (transferResult.success) {
      // Update withdrawal request as processed
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          transaction_reference: transferResult.reference,
          flutterwave_transfer_id: transferResult.transferId
        })
        .eq('id', withdrawalRequest.id);

      // Send success notification
      await supabase
        .from('notifications')
        .insert({
          user_id: paymentRequest.userId,
          type: 'payout_success',
          title: 'Payout Successful',
          content: `Your payout of ₦${paymentRequest.amount.toLocaleString()} has been processed successfully.`
        });

      return {
        id: withdrawalRequest.id,
        status: 'success',
        message: 'Payment processed successfully',
        transactionId: transferResult.transferId
      };
    } else {
      // Transfer failed - update status
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'failed' })
        .eq('id', withdrawalRequest.id);

      return {
        id: withdrawalRequest.id,
        status: 'failed',
        message: transferResult.message || 'Transfer initiation failed'
      };
    }

  } catch (error) {
    console.error('Error in processInstantUserPayment:', error);
    return {
      id: '',
      status: 'failed',
      message: 'Unexpected error occurred'
    };
  }
};

/**
 * Get pending user payments that need processing
 */
export const getPendingUserPayments = async () => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      profiles:user_id (
        name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending payments:', error);
    return [];
  }

  return data || [];
};

/**
 * Bulk process multiple user payments
 */
export const bulkProcessUserPayments = async (
  paymentRequestIds: string[]
): Promise<ProcessedPayment[]> => {
  const results: ProcessedPayment[] = [];

  for (const requestId of paymentRequestIds) {
    try {
      // Get the withdrawal request
      const { data: request } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (request) {
        const result = await processInstantUserPayment({
          userId: request.user_id,
          amount: request.amount,
          payoutMethod: request.payout_method,
          payoutDetails: request.payout_details,
          description: `Bulk payment processing - ${requestId}`
        });

        results.push(result);
      }
    } catch (error) {
      console.error(`Error processing payment ${requestId}:`, error);
      results.push({
        id: requestId,
        status: 'failed',
        message: 'Processing error'
      });
    }
  }

  return results;
};

/**
 * Initiate Flutterwave transfer
 */
const initiateFlutterwaveTransfer = async (params: {
  amount: number;
  accountNumber: string;
  accountBank: string;
  beneficiaryName: string;
  reference: string;
  narration: string;
}): Promise<{ success: boolean; transferId?: string; reference?: string; message?: string }> => {
  try {
    // Call Supabase Edge Function to initiate transfer
    const { data, error } = await supabase.functions.invoke('flutterwave-transfer', {
      body: {
        amount: params.amount,
        account_number: params.accountNumber,
        account_bank: params.accountBank,
        beneficiary_name: params.beneficiaryName,
        reference: params.reference,
        narration: params.narration,
        currency: 'NGN'
      }
    });

    if (error) {
      console.error('Error invoking transfer function:', error);
      return { success: false, message: error.message };
    }

    if (data?.success) {
      return {
        success: true,
        transferId: data.transfer_id,
        reference: data.reference
      };
    } else {
      return {
        success: false,
        message: data?.message || 'Transfer initiation failed'
      };
    }
  } catch (error) {
    console.error('Error in initiateFlutterwaveTransfer:', error);
    return {
      success: false,
      message: 'Transfer service error'
    };
  }
};