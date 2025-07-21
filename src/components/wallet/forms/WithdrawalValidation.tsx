
import React from "react";
import { AlertTriangle } from "lucide-react";

interface WithdrawalValidationProps {
  withdrawalAmount: number;
  paymentMethod: string;
  payoutDetails: any;
  userPoints: number;
  minWithdrawal: number;
}

export const WithdrawalValidation = ({
  withdrawalAmount,
  paymentMethod,
  payoutDetails,
  userPoints,
  minWithdrawal
}: WithdrawalValidationProps) => {
  const isValidRequest = () => {
    if (paymentMethod === 'gift_card') {
      return payoutDetails.giftCardId && userPoints >= (payoutDetails.amount || 0);
    }
    if (paymentMethod === 'yield_wallet') {
      return withdrawalAmount >= 100 && withdrawalAmount <= userPoints;
    }
    if (paymentMethod === 'crypto') {
      return payoutDetails.cryptoType && payoutDetails.walletAddress && withdrawalAmount >= minWithdrawal;
    }
    if (paymentMethod === 'bank_transfer') {
      return payoutDetails.accountNumber && payoutDetails.bankCode && payoutDetails.accountName && withdrawalAmount >= minWithdrawal;
    }
    if (paymentMethod === 'flutterwave') {
      return payoutDetails.accountNumber && 
             payoutDetails.bankCode && 
             payoutDetails.accountName && 
             payoutDetails.phoneNumber &&
             payoutDetails.currency &&
             payoutDetails.country &&
             withdrawalAmount >= minWithdrawal && 
             userPoints >= withdrawalAmount;
    }
    return false;
  };

  if (withdrawalAmount > 0 && !isValidRequest()) {
    return (
      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <span className="text-sm text-orange-800">
          Please complete all required fields
        </span>
      </div>
    );
  }

  return null;
};

export const useWithdrawalValidation = (
  withdrawalAmount: number,
  paymentMethod: string,
  payoutDetails: any,
  userPoints: number,
  minWithdrawal: number
) => {
  const isValidRequest = () => {
    if (paymentMethod === 'gift_card') {
      return payoutDetails.giftCardId && userPoints >= (payoutDetails.amount || 0);
    }
    if (paymentMethod === 'yield_wallet') {
      return withdrawalAmount >= 100 && withdrawalAmount <= userPoints;
    }
    if (paymentMethod === 'crypto') {
      return payoutDetails.cryptoType && payoutDetails.walletAddress && withdrawalAmount >= minWithdrawal;
    }
    if (paymentMethod === 'bank_transfer') {
      return payoutDetails.accountNumber && payoutDetails.bankCode && payoutDetails.accountName && withdrawalAmount >= minWithdrawal;
    }
    if (paymentMethod === 'flutterwave') {
      return payoutDetails.accountNumber && 
             payoutDetails.bankCode && 
             payoutDetails.accountName && 
             payoutDetails.phoneNumber &&
             payoutDetails.currency &&
             payoutDetails.country &&
             withdrawalAmount >= minWithdrawal && 
             userPoints >= withdrawalAmount;
    }
    return false;
  };

  return isValidRequest();
};
