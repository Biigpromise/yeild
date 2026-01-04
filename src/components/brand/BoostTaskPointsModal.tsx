import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, TrendingUp, AlertCircle, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getMinPointsForDifficulty } from '@/constants/taskDifficulty';
import { useNavigate } from 'react-router-dom';

interface BoostTaskPointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    title: string;
    points: number;
    original_points?: number;
    difficulty?: string;
  };
  onSuccess?: () => void;
}

export const BoostTaskPointsModal: React.FC<BoostTaskPointsModalProps> = ({
  open,
  onOpenChange,
  task,
  onSuccess
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newPoints, setNewPoints] = useState(task.points + 100);

  const currentPoints = task.points;
  const originalPoints = task.original_points || task.points;
  const minPoints = getMinPointsForDifficulty(task.difficulty || 'easy');
  const additionalPointsNeeded = newPoints - currentPoints;

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['brand-wallet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && open
  });

  const walletBalance = wallet?.balance || 0;
  const hasInsufficientFunds = additionalPointsNeeded > walletBalance;
  const isValidBoost = newPoints > currentPoints && additionalPointsNeeded > 0;

  const boostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Get current task data first
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('point_boost_history')
        .eq('id', task.id)
        .single();

      if (fetchError) throw fetchError;

      // Prepare the new boost history
      const currentHistory = (currentTask?.point_boost_history as any[]) || [];
      const newHistory = [
        ...currentHistory,
        {
          from_points: currentPoints,
          to_points: newPoints,
          boosted_at: new Date().toISOString(),
          additional_cost: additionalPointsNeeded
        }
      ];

      // Update the task points
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .update({
          points: newPoints,
          original_points: originalPoints,
          point_boost_history: newHistory,
          last_boosted_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. Deduct from wallet
      const { error: walletError } = await supabase
        .from('brand_wallets')
        .update({
          balance: walletBalance - additionalPointsNeeded,
          total_spent: (wallet?.total_spent || 0) + additionalPointsNeeded
        })
        .eq('brand_id', user.id);

      if (walletError) throw walletError;

      // 3. Record the transaction
      const { error: txError } = await supabase
        .from('brand_wallet_transactions')
        .insert({
          brand_id: user.id,
          wallet_id: wallet!.id,
          transaction_type: 'task_boost',
          amount: -additionalPointsNeeded,
          balance_after: walletBalance - additionalPointsNeeded,
          description: `Boosted task "${task.title}" from ${currentPoints} to ${newPoints} points`
        });

      if (txError) throw txError;

      return taskData;
    },
    onSuccess: () => {
      toast.success(`Task boosted to ${newPoints} points!`);
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to boost task points');
    }
  });

  const suggestedBoosts = [
    { label: '+10%', value: Math.round(currentPoints * 1.1) },
    { label: '+25%', value: Math.round(currentPoints * 1.25) },
    { label: '+50%', value: Math.round(currentPoints * 1.5) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Boost Task Points
          </DialogTitle>
          <DialogDescription>
            Increase the reward for "{task.title}" to attract more participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Balance */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Wallet Balance</span>
            </div>
            <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : 'text-green-600'}`}>
              ₦{walletBalance.toLocaleString()}
            </span>
          </div>

          {/* Current Points Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Current Points</p>
              <p className="text-xl font-bold">{currentPoints}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">New Points</p>
              <p className="text-xl font-bold text-primary">{newPoints}</p>
            </div>
          </div>

          {/* Quick Boost Options */}
          <div>
            <Label className="text-sm">Quick Boost</Label>
            <div className="flex gap-2 mt-2">
              {suggestedBoosts.map((boost) => (
                <Button
                  key={boost.label}
                  variant={newPoints === boost.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewPoints(boost.value)}
                  disabled={boost.value > walletBalance + currentPoints}
                >
                  {boost.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Points Input */}
          <div>
            <Label htmlFor="newPoints">Custom Points Value</Label>
            <Input
              id="newPoints"
              type="number"
              value={newPoints}
              onChange={(e) => setNewPoints(Math.max(currentPoints + 1, parseInt(e.target.value) || 0))}
              min={currentPoints + 1}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be higher than current ({currentPoints} points)
            </p>
          </div>

          {/* Cost Breakdown */}
          {isValidBoost && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Boost Summary</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Point Increase</span>
                  <span>+{additionalPointsNeeded} points</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Cost</span>
                  <span className="text-primary">₦{additionalPointsNeeded.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Insufficient Funds Warning */}
          {hasInsufficientFunds && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient funds. You need ₦{(additionalPointsNeeded - walletBalance).toLocaleString()} more.
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-destructive"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/brand-dashboard/finance');
                  }}
                >
                  Fund your wallet
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => boostMutation.mutate()}
              disabled={!isValidBoost || hasInsufficientFunds || boostMutation.isPending}
              className="flex-1"
            >
              {boostMutation.isPending ? (
                'Boosting...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Boost Points
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
