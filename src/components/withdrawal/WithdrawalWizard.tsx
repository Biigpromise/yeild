import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { WithdrawalMethodSelector } from './WithdrawalMethodSelector';
import { WithdrawalAmountInput } from './WithdrawalAmountInput';
import { WithdrawalConfirmation } from './WithdrawalConfirmation';
import { PaystackPayment } from './PaystackPayment';

interface WithdrawalWizardProps {
  userBalance: number;
  onWithdrawalSubmitted: () => void;
}

const steps = [
  { id: 1, title: 'Select Method', description: 'Choose withdrawal method' },
  { id: 2, title: 'Enter Amount', description: 'Specify withdrawal amount' },
  { id: 3, title: 'Confirm', description: 'Review and submit' }
];

export const WithdrawalWizard: React.FC<WithdrawalWizardProps> = ({
  userBalance,
  onWithdrawalSubmitted
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [payoutDetails, setPayoutDetails] = useState<any>({});

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedMethod !== '';
      case 2:
        const hasAmount = amount !== '' && parseFloat(amount) > 0;
        // If paystack is selected, also require bank details
        if (selectedMethod === 'paystack') {
          return hasAmount && 
                 payoutDetails.accountNumber && 
                 payoutDetails.bankCode && 
                 payoutDetails.accountName &&
                 payoutDetails.accountNumber.length === 10;
        }
        return hasAmount;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="space-y-6">
        <CardTitle className="text-2xl font-bold text-center">Complete Your Withdrawal</CardTitle>
        
        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between gap-2">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1 min-w-0">
                <div className="flex items-center">
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  ) : currentStep === step.id ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                      {step.id}
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-xs sm:text-sm font-medium truncate ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <WithdrawalMethodSelector
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
              onDetailsChange={setPayoutDetails}
            />
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <WithdrawalAmountInput
                amount={amount}
                onAmountChange={setAmount}
                userBalance={userBalance}
                selectedMethod={selectedMethod}
              />
              
              {/* Show bank details form for Paystack */}
              {selectedMethod === 'paystack' && (
                <div className="pt-6 border-t border-border/50">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Enter Bank Details</h3>
                    <p className="text-muted-foreground">Provide your Nigerian bank account information</p>
                  </div>
                  <PaystackPayment
                    payoutDetails={payoutDetails}
                    onDetailsChange={setPayoutDetails}
                  />
                </div>
              )}
            </div>
          )}
          
          {currentStep === 3 && (
            <WithdrawalConfirmation
              selectedMethod={selectedMethod}
              amount={amount}
              payoutDetails={payoutDetails}
              userBalance={userBalance}
              onSubmit={onWithdrawalSubmitted}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="w-32"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="w-32"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="w-32" /> // Placeholder for layout
          )}
        </div>
      </CardContent>
    </Card>
  );
};