import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface FundTransfer {
  id: string;
  transfer_reference: string;
  flutterwave_id: string;
  source_type: string;
  amount: number;
  fee: number;
  net_amount: number;
  recipient_account: string;
  recipient_bank: string;
  status: string;
  transfer_date: string;
  settlement_date: string;
  error_message: string;
  retry_count: number;
}

export const TransfersList: React.FC = () => {
  const [transfers, setTransfers] = useState<FundTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('fund_transfers')
        .select('*')
        .order('transfer_date', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.transfer_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.recipient_account.includes(searchTerm) ||
    transfer.flutterwave_id?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processing: { variant: 'default' as const, icon: RefreshCw },
      successful: { variant: 'default' as const, icon: CheckCircle },
      failed: { variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Fund Transfers
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransfers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Transfers Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {transfer.transfer_reference}
                      </div>
                      {transfer.flutterwave_id && (
                        <div className="text-xs text-muted-foreground">
                          FLW: {transfer.flutterwave_id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(transfer.net_amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fee: {formatCurrency(transfer.fee)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transfer.recipient_bank}</div>
                      <div className="text-xs text-muted-foreground">
                        {transfer.recipient_account}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transfer.status)}
                    {transfer.retry_count > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        Retries: {transfer.retry_count}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(transfer.transfer_date), { 
                        addSuffix: true 
                      })}
                    </div>
                    {transfer.settlement_date && (
                      <div className="text-xs text-muted-foreground">
                        Settled: {formatDistanceToNow(new Date(transfer.settlement_date), { 
                          addSuffix: true 
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {transfer.flutterwave_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Open Flutterwave dashboard in new tab
                          window.open(
                            `https://dashboard.flutterwave.com/transfers/${transfer.flutterwave_id}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTransfers.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No transfers found
          </div>
        )}
      </CardContent>
    </Card>
  );
};