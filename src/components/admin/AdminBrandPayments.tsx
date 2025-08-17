import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, DollarSign } from 'lucide-react';

export const AdminBrandPayments: React.FC = () => {
  const [reconciling, setReconciling] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [txRef, setTxRef] = useState('');
  const [results, setResults] = useState<any>(null);

  const reconcilePayments = async () => {
    setReconciling(true);
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-brand-payments', {
        body: {
          user_id: userEmail ? undefined : undefined, // We'll filter by email client-side if needed
          tx_ref: txRef || undefined,
          dry_run: dryRun,
          limit: 100
        }
      });

      if (error) throw error;

      setResults(data);
      toast.success(`${dryRun ? 'Simulation' : 'Reconciliation'} completed`);
    } catch (error) {
      console.error('Reconciliation error:', error);
      toast.error('Failed to reconcile payments');
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Brand Payment Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userEmail">User Email (optional)</Label>
              <Input
                id="userEmail"
                placeholder="user@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="txRef">Transaction Reference (optional)</Label>
              <Input
                id="txRef"
                placeholder="TX_REF_123"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dryRun"
              checked={dryRun}
              onCheckedChange={(checked) => setDryRun(checked as boolean)}
            />
            <Label htmlFor="dryRun">
              Dry Run (simulate without making changes)
            </Label>
          </div>

          <Button
            onClick={reconcilePayments}
            disabled={reconciling}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
            {reconciling 
              ? 'Processing...' 
              : `${dryRun ? 'Simulate' : 'Run'} Reconciliation`
            }
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Processed</div>
                  <div className="text-2xl font-bold text-green-700">
                    {results.reconciled || 0}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Total Found</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {results.details?.length || 0}
                  </div>
                </div>
              </div>

              {results.details && results.details.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Payment Details:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {results.details.map((detail: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-gray-50 rounded border-l-4 border-l-blue-400"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono">{detail.tx_ref}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            detail.action === 'deposited' ? 'bg-green-100 text-green-700' :
                            detail.action === 'would_deposit' ? 'bg-yellow-100 text-yellow-700' :
                            detail.action === 'skipped_exists' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {detail.action}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          Amount: ₦{detail.amount?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};