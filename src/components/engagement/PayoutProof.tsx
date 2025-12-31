import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Wallet, 
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface PayoutRecord {
  id: string;
  amount: number;
  created_at: string;
  user_initials: string;
}

export const PayoutProof: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadPayoutData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPayoutData = async () => {
    try {
      // Get recent completed withdrawals (anonymized)
      const { data: withdrawals, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          amount,
          created_at,
          user_id
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!mountedRef.current) return;

      if (error) throw error;

      // Anonymize user data
      const anonymizedPayouts: PayoutRecord[] = (withdrawals || []).map(w => ({
        id: w.id,
        amount: w.amount,
        created_at: w.created_at,
        user_initials: generateRandomInitials()
      }));

      setPayouts(anonymizedPayouts);

      // Get total stats
      const { count } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (!mountedRef.current) return;

      setTotalPayouts(count || 0);

      // Calculate total paid
      const total = anonymizedPayouts.reduce((sum, p) => sum + p.amount, 0);
      setTotalPaid(total);
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const generateRandomInitials = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-40 bg-muted/20 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // If no payouts yet, show encouraging message
  if (payouts.length === 0) {
    return (
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-lg">Secure Payouts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            YEILD ensures secure and timely payouts to all users. Complete tasks, earn points, and withdraw your earnings with confidence.
          </p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verified payment system</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Recent Payouts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real withdrawals from our users
              </p>
            </div>
          </div>
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            {totalPayouts} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {payouts.slice(0, 5).map((payout, index) => (
          <motion.div
            key={payout.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-background/60"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-semibold text-sm">
              {payout.user_initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {formatAmount(payout.amount)}
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(payout.created_at), { addSuffix: true })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Trust indicators */}
        <div className="pt-3 border-t border-border/60">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-green-600" />
              <span>Fast Processing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
