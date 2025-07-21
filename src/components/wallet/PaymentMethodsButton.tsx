
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, CreditCard, Plus, Edit } from 'lucide-react';
import { BankAccountSelector } from './BankAccountSelector';

export const PaymentMethodsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Payment Methods
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manage Payment Methods
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Bank Accounts</h3>
            <p className="text-sm text-blue-700">
              Add and manage your bank accounts for withdrawals. You can set a default account for faster transactions.
            </p>
          </div>

          <BankAccountSelector
            onAccountSelect={handleAccountSelect}
            selectedAccount={selectedAccount}
          />

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-md border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Crypto Wallets</span>
                </div>
                <p className="text-xs text-gray-500">
                  Add Bitcoin, Ethereum, and other cryptocurrency wallets
                </p>
              </div>
              
              <div className="p-3 bg-white rounded-md border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Gift Cards</span>
                </div>
                <p className="text-xs text-gray-500">
                  Redeem points for Amazon, iTunes, and other gift cards
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
