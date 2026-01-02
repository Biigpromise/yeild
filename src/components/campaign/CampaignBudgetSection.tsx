import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DollarSign, Wallet, CreditCard, Calendar, AlertCircle, TrendingUp, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetEstimateCalculator } from '@/components/brand/BudgetEstimateCalculator';

interface BudgetData {
  budget: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  funding_source: 'wallet' | 'payment';
}

interface CampaignBudgetSectionProps {
  budgetData: BudgetData;
  onBudgetDataChange: (data: BudgetData) => void;
}

export const CampaignBudgetSection: React.FC<CampaignBudgetSectionProps> = ({
  budgetData,
  onBudgetDataChange
}) => {
  const { user } = useAuth();
  const [conversionRate, setConversionRate] = useState(1500); // USD to NGN
  const [showCalculator, setShowCalculator] = useState(true);

  const { data: wallet } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const updateField = (field: keyof BudgetData, value: any) => {
    onBudgetDataChange({
      ...budgetData,
      [field]: value
    });
  };

  const convertedAmount = budgetData.currency === 'NGN' 
    ? budgetData.budget / conversionRate
    : budgetData.budget * conversionRate;

  const estimatedReach = Math.floor(budgetData.budget * (budgetData.currency === 'NGN' ? 0.01 : 15));
  const estimatedTasks = Math.floor(budgetData.budget * (budgetData.currency === 'NGN' ? 0.005 : 7));

  const hasInsufficientFunds = budgetData.funding_source === 'wallet' && 
    wallet && 
    budgetData.budget > wallet.balance;

  const getFundingRecommendation = () => {
    if (!wallet) return null;
    
    if (wallet.balance < 10000) {
      return "We recommend funding your wallet with at least ₦10,000 for better campaign flexibility.";
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Budget Estimate Calculator - Collapsible */}
      <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
        <Card className="border-primary/20 bg-primary/5">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Estimate Your Campaign Results
                </div>
                {showCalculator ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate how many completions your budget will achieve before setting your campaign budget
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <BudgetEstimateCalculator />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium">Currency</Label>
          <Select value={budgetData.currency} onValueChange={(value) => updateField('currency', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Campaign Budget *
          </Label>
          <Input
            type="number"
            min="1000"
            step="100"
            value={budgetData.budget || ''}
            onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)}
            placeholder={budgetData.currency === 'NGN' ? '10,000' : '10'}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {budgetData.currency === 'NGN' ? 'Minimum: ₦1,000' : 'Minimum: $10'} 
            {budgetData.budget > 0 && (
              <span className="ml-2">
                ≈ {budgetData.currency === 'USD' ? '₦' : '$'}{convertedAmount.toLocaleString()} 
                {budgetData.currency === 'USD' ? ' NGN' : ' USD'}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Start Date
          </Label>
          <Input
            type="date"
            value={budgetData.start_date || ''}
            onChange={(e) => updateField('start_date', e.target.value)}
            className="mt-2"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            End Date
          </Label>
          <Input
            type="date"
            value={budgetData.end_date || ''}
            onChange={(e) => updateField('end_date', e.target.value)}
            className="mt-2"
            min={budgetData.start_date || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-4 block">Funding Source *</Label>
        <RadioGroup 
          value={budgetData.funding_source} 
          onValueChange={(value) => updateField('funding_source', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
            <RadioGroupItem value="wallet" id="wallet" />
            <div className="flex-1">
              <Label htmlFor="wallet" className="flex items-center gap-2 font-medium cursor-pointer">
                <Wallet className="h-4 w-4" />
                Fund from Wallet
              </Label>
              <p className="text-sm text-muted-foreground">
                {wallet ? (
                  <>Current balance: ₦{wallet.balance.toLocaleString()}</>
                ) : (
                  'Loading wallet information...'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
            <RadioGroupItem value="payment" id="payment" />
            <div className="flex-1">
              <Label htmlFor="payment" className="flex items-center gap-2 font-medium cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Direct Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                Pay directly with card or bank transfer
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {hasInsufficientFunds && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Insufficient wallet balance. You need ₦{budgetData.budget.toLocaleString()} but only have ₦{wallet?.balance.toLocaleString()}. 
            Please choose direct payment or fund your wallet first.
          </AlertDescription>
        </Alert>
      )}

      {getFundingRecommendation() && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            {getFundingRecommendation()}
          </AlertDescription>
        </Alert>
      )}

      {budgetData.budget > 0 && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100 text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estimated Campaign Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {estimatedReach.toLocaleString()}+
                </div>
                <div className="text-sm text-green-700 dark:text-green-200">Estimated Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {estimatedTasks.toLocaleString()}+
                </div>
                <div className="text-sm text-green-700 dark:text-green-200">Expected Tasks</div>
              </div>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200 text-center">
              *Estimates based on average campaign performance. Actual results may vary.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Budget Planning Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Higher budgets typically result in better reach and engagement</li>
            <li>• Consider running campaigns for at least 7-14 days for optimal results</li>
            <li>• Wallet funding offers faster campaign approval</li>
            <li>• Monitor performance and adjust budget for future campaigns</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};