import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUpRight } from 'lucide-react';
import { WithdrawalForm } from './WithdrawalForm';

interface WithdrawalButtonProps {
  userPoints: number;
}

export const WithdrawalButton: React.FC<WithdrawalButtonProps> = ({ userPoints }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWithdrawalSubmitted = () => {
    setIsOpen(false);
    // Optionally refresh the parent component
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Withdraw Points</DialogTitle>
        </DialogHeader>
        <WithdrawalForm 
          userPoints={userPoints} 
          onWithdrawalSubmitted={handleWithdrawalSubmitted}
        />
      </DialogContent>
    </Dialog>
  );
};