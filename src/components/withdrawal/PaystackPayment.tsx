import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Search, Sparkles, Building2, Landmark } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaystackPaymentProps {
  payoutDetails: any;
  onDetailsChange: (details: any) => void;
}

interface BankOption {
  code: string;
  name: string;
  shortName?: string;
  category: 'fintech' | 'major' | 'other';
}

// Comprehensive Nigerian banks list with popular fintechs at top
const NIGERIAN_BANKS: BankOption[] = [
  // Popular Fintechs - Most used in Nigeria
  { code: '999992', name: 'OPay', shortName: 'OPay', category: 'fintech' },
  { code: '50515', name: 'Moniepoint MFB', shortName: 'Moniepoint', category: 'fintech' },
  { code: '999991', name: 'PalmPay', shortName: 'PalmPay', category: 'fintech' },
  { code: '090267', name: 'Kuda Bank', shortName: 'Kuda', category: 'fintech' },
  { code: '565', name: 'Carbon (One Finance)', shortName: 'Carbon', category: 'fintech' },
  { code: '51318', name: 'Fairmoney MFB', shortName: 'Fairmoney', category: 'fintech' },
  { code: '100033', name: 'Piggyvest (PocketApp)', shortName: 'Piggyvest', category: 'fintech' },
  { code: '090325', name: 'Sparkle MFB', shortName: 'Sparkle', category: 'fintech' },
  { code: '090110', name: 'VFD Microfinance Bank', shortName: 'VFD', category: 'fintech' },
  
  // Major Banks
  { code: '058', name: 'Guaranty Trust Bank', shortName: 'GTBank', category: 'major' },
  { code: '057', name: 'Zenith Bank', category: 'major' },
  { code: '011', name: 'First Bank of Nigeria', shortName: 'First Bank', category: 'major' },
  { code: '044', name: 'Access Bank', category: 'major' },
  { code: '033', name: 'United Bank For Africa', shortName: 'UBA', category: 'major' },
  { code: '214', name: 'First City Monument Bank', shortName: 'FCMB', category: 'major' },
  { code: '070', name: 'Fidelity Bank', category: 'major' },
  { code: '221', name: 'Stanbic IBTC Bank', shortName: 'Stanbic IBTC', category: 'major' },
  { code: '068', name: 'Standard Chartered Bank', category: 'major' },
  { code: '063', name: 'Access Bank (Diamond)', shortName: 'Diamond Bank', category: 'major' },
  
  // Other Banks
  { code: '050', name: 'Ecobank Nigeria', shortName: 'Ecobank', category: 'other' },
  { code: '030', name: 'Heritage Bank', category: 'other' },
  { code: '301', name: 'Jaiz Bank', category: 'other' },
  { code: '082', name: 'Keystone Bank', category: 'other' },
  { code: '526', name: 'Parallex Bank', category: 'other' },
  { code: '101', name: 'Providus Bank', category: 'other' },
  { code: '076', name: 'Polaris Bank', category: 'other' },
  { code: '232', name: 'Sterling Bank', category: 'other' },
  { code: '100', name: 'Suntrust Bank', category: 'other' },
  { code: '032', name: 'Union Bank of Nigeria', shortName: 'Union Bank', category: 'other' },
  { code: '215', name: 'Unity Bank', category: 'other' },
  { code: '035', name: 'Wema Bank', category: 'other' },
  { code: '090405', name: 'Moniepoint MFB (Alt)', shortName: 'Moniepoint Alt', category: 'other' },
  { code: '090329', name: '9PSB (9 Payment Service Bank)', shortName: '9PSB', category: 'other' },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'fintech':
      return <Sparkles className="h-3 w-3 text-primary" />;
    case 'major':
      return <Landmark className="h-3 w-3 text-blue-500" />;
    default:
      return <Building2 className="h-3 w-3 text-muted-foreground" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'fintech':
      return '🔥 Popular Fintechs';
    case 'major':
      return '🏦 Major Banks';
    default:
      return '🏢 Other Banks';
  }
};

export const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  payoutDetails,
  onDetailsChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (field: string, value: string) => {
    onDetailsChange({
      ...payoutDetails,
      [field]: value,
    });
  };

  const selectedBank = NIGERIAN_BANKS.find(b => b.code === payoutDetails.bankCode);
  const isAccountNumberValid = payoutDetails.accountNumber?.length === 10;

  // Group banks by category
  const groupedBanks = useMemo(() => {
    const filtered = searchQuery
      ? NIGERIAN_BANKS.filter(bank =>
          bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (bank.shortName && bank.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          bank.code.includes(searchQuery)
        )
      : NIGERIAN_BANKS;

    return {
      fintech: filtered.filter(b => b.category === 'fintech'),
      major: filtered.filter(b => b.category === 'major'),
      other: filtered.filter(b => b.category === 'other'),
    };
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Low Fees with Paystack</p>
            <p className="text-xs text-muted-foreground">
              Only 2% processing fee • Supports all Nigerian banks including OPay, Moniepoint, Kuda
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label>Select Bank</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-10 font-normal"
            >
              {selectedBank ? (
                <div className="flex items-center gap-2">
                  {getCategoryIcon(selectedBank.category)}
                  <span>{selectedBank.shortName || selectedBank.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Search for your bank...</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search banks..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>No bank found.</CommandEmpty>
                
                {groupedBanks.fintech.length > 0 && (
                  <CommandGroup heading={getCategoryLabel('fintech')}>
                    {groupedBanks.fintech.map((bank) => (
                      <CommandItem
                        key={bank.code}
                        value={`${bank.name} ${bank.shortName || ''}`}
                        onSelect={() => {
                          handleInputChange('bankCode', bank.code);
                          setOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2"
                      >
                        {getCategoryIcon(bank.category)}
                        <span>{bank.shortName || bank.name}</span>
                        {bank.code === payoutDetails.bankCode && (
                          <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {groupedBanks.major.length > 0 && (
                  <CommandGroup heading={getCategoryLabel('major')}>
                    {groupedBanks.major.map((bank) => (
                      <CommandItem
                        key={bank.code}
                        value={`${bank.name} ${bank.shortName || ''}`}
                        onSelect={() => {
                          handleInputChange('bankCode', bank.code);
                          setOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2"
                      >
                        {getCategoryIcon(bank.category)}
                        <span>{bank.shortName || bank.name}</span>
                        {bank.code === payoutDetails.bankCode && (
                          <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {groupedBanks.other.length > 0 && (
                  <CommandGroup heading={getCategoryLabel('other')}>
                    {groupedBanks.other.map((bank) => (
                      <CommandItem
                        key={bank.code}
                        value={`${bank.name} ${bank.shortName || ''}`}
                        onSelect={() => {
                          handleInputChange('bankCode', bank.code);
                          setOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2"
                      >
                        {getCategoryIcon(bank.category)}
                        <span>{bank.shortName || bank.name}</span>
                        {bank.code === payoutDetails.bankCode && (
                          <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paystack-account">Account Number</Label>
        <Input
          id="paystack-account"
          type="text"
          placeholder="0123456789"
          value={payoutDetails.accountNumber || ''}
          onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
        />
        {payoutDetails.accountNumber && !isAccountNumberValid && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Account number must be 10 digits
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paystack-name">Account Name</Label>
        <Input
          id="paystack-name"
          type="text"
          placeholder="Account holder name"
          value={payoutDetails.accountName || ''}
          onChange={(e) => handleInputChange('accountName', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Ensure this matches your bank account name exactly
        </p>
      </div>

      {selectedBank && isAccountNumberValid && payoutDetails.accountName && (
        <Card className="p-3 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Ready to process withdrawal</span>
          </div>
        </Card>
      )}
    </div>
  );
};
