import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CurrencyConverterProps {
  onConversionUpdate?: (rate: number, from: string, to: string) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConversionUpdate }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [rate, setRate] = useState<number | null>(1500);
  const [loading, setLoading] = useState(false);

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('currency-conversion', {
        body: {
          from: fromCurrency,
          to: toCurrency
        }
      });

      if (error) throw error;

      const newRate = data?.data?.rate || 1500;
      setRate(newRate);
      onConversionUpdate?.(newRate, fromCurrency, toCurrency);
      
      toast.success(`Exchange rate updated: 1 ${fromCurrency} = ${newRate} ${toCurrency}`);
    } catch (error: any) {
      console.error('Error fetching exchange rate:', error);
      toast.error('Failed to fetch exchange rate');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
  ];

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Currency Converter</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="to-currency">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {rate && (
            <span>1 {fromCurrency} = {rate.toLocaleString()} {toCurrency}</span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchExchangeRate}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Update Rate
        </Button>
      </div>
    </div>
  );
};