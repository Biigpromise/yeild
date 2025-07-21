
import { useMemo } from 'react';

export const useWithdrawalValidation = (
  amount: number,
  paymentMethod: string,
  payoutDetails: any,
  userPoints: number,
  minWithdrawal: number
) => {
  return useMemo(() => {
    // Basic amount validation
    if (amount <= 0) return false;
    if (amount > userPoints) return false;

    // Method-specific validation
    switch (paymentMethod) {
      case 'yield_wallet':
        return amount >= 100; // Minimum 100 points for yield wallet
      
      case 'flutterwave':
        if (amount < minWithdrawal) return false;
        return !!(
          payoutDetails.accountNumber &&
          payoutDetails.bankCode &&
          payoutDetails.accountName &&
          payoutDetails.accountNumber.length === 10
        );
      
      case 'crypto':
        return !!(
          amount >= minWithdrawal &&
          payoutDetails.walletAddress &&
          payoutDetails.cryptoType
        );
      
      case 'gift_card':
        return !!(
          amount >= minWithdrawal &&
          payoutDetails.giftCardProvider &&
          payoutDetails.denomination
        );
      
      default:
        return false;
    }
  }, [amount, paymentMethod, payoutDetails, userPoints, minWithdrawal]);
};
