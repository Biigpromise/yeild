
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface WithdrawalValidationProps {
  withdrawalAmount: number;
  paymentMethod: string;
  payoutDetails: any;
  userPoints: number;
  minWithdrawal: number;
}

export const WithdrawalValidation: React.FC<WithdrawalValidationProps> = ({
  withdrawalAmount,
  paymentMethod,
  payoutDetails,
  userPoints,
  minWithdrawal
}) => {
  const validationResults = [];

  // Amount validation
  if (withdrawalAmount <= 0) {
    validationResults.push({
      type: 'error',
      message: 'Please enter a valid withdrawal amount'
    });
  } else if (withdrawalAmount > userPoints) {
    validationResults.push({
      type: 'error',
      message: `Insufficient points. You have ${userPoints.toLocaleString()} points available`
    });
  } else if (paymentMethod !== 'yield_wallet' && withdrawalAmount < minWithdrawal) {
    validationResults.push({
      type: 'error',
      message: `Minimum withdrawal amount is ${minWithdrawal.toLocaleString()} points`
    });
  } else if (paymentMethod === 'yield_wallet' && withdrawalAmount < 100) {
    validationResults.push({
      type: 'error',
      message: 'Minimum transfer to yield wallet is 100 points'
    });
  } else {
    validationResults.push({
      type: 'success',
      message: 'Withdrawal amount is valid'
    });
  }

  // Method-specific validation
  switch (paymentMethod) {
    case 'flutterwave':
      if (!payoutDetails.accountNumber) {
        validationResults.push({
          type: 'error',
          message: 'Please enter your account number'
        });
      } else if (payoutDetails.accountNumber.length !== 10) {
        validationResults.push({
          type: 'error',
          message: 'Account number must be 10 digits'
        });
      }
      
      if (!payoutDetails.bankCode) {
        validationResults.push({
          type: 'error',
          message: 'Please select your bank'
        });
      }
      
      if (!payoutDetails.accountName) {
        validationResults.push({
          type: 'error',
          message: 'Please verify your account to get the account name'
        });
      } else {
        validationResults.push({
          type: 'success',
          message: 'Bank details are complete'
        });
      }
      break;

    case 'yield_wallet':
      validationResults.push({
        type: 'success',
        message: 'Ready to transfer to yield wallet'
      });
      break;

    case 'crypto':
      if (!payoutDetails.walletAddress) {
        validationResults.push({
          type: 'error',
          message: 'Please enter your wallet address'
        });
      }
      if (!payoutDetails.cryptoType) {
        validationResults.push({
          type: 'error',
          message: 'Please select cryptocurrency type'
        });
      }
      break;

    case 'gift_card':
      if (!payoutDetails.giftCardProvider) {
        validationResults.push({
          type: 'error',
          message: 'Please select a gift card provider'
        });
      }
      break;
  }

  if (validationResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validationResults.map((result, index) => (
        <Alert key={index} className={result.type === 'error' ? 'border-red-200' : 'border-green-200'}>
          {result.type === 'error' ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <AlertDescription className={result.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {result.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export { useWithdrawalValidation } from '@/hooks/useWithdrawalValidation';
