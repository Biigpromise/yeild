import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Rocket, 
  User, 
  Zap, 
  Users, 
  Wallet,
  ArrowRight,
  Gift,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  reward: number;
  action?: string;
  route?: string;
}

export const GettingStartedChecklist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (user) {
      checkProgress();
    }
  }, [user]);

  const checkProgress = async () => {
    if (!user) return;
    
    try {
      // Check profile completion and get referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, referral_code, active_referrals_count')
        .eq('id', user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Check if user has completed any tasks
      const { count: tasksCompleted } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved');

      // Check if user has requested a withdrawal
      const { count: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const profileComplete = !!(profile?.name);
      const hasReferrals = (profile?.active_referrals_count || 0) > 0;

      setItems([
        {
          id: 'profile',
          title: 'Complete Your Profile',
          description: 'Add your name to get started',
          icon: User,
          completed: profileComplete,
          reward: 50,
          action: 'Complete Profile',
          route: '/profile'
        },
        {
          id: 'first-task',
          title: 'Complete Your First Task',
          description: 'Browse and complete an available task',
          icon: Zap,
          completed: (tasksCompleted || 0) > 0,
          reward: 100,
          action: 'Browse Tasks',
          route: '/tasks'
        },
        {
          id: 'referral',
          title: 'Invite a Friend',
          description: 'Share your referral link with friends',
          icon: Users,
          completed: hasReferrals,
          reward: 200,
          action: 'Copy Referral Link'
        },
        {
          id: 'withdrawal',
          title: 'Request Your First Withdrawal',
          description: 'Cash out your earned points',
          icon: Gift,
          completed: (withdrawals || 0) > 0,
          reward: 0,
          action: 'Withdraw',
          route: '/withdraw'
        }
      ]);
    } catch (error) {
      console.error('Error checking checklist progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) {
      toast.error('Referral code not available. Please try again.');
      return;
    }
    
    try {
      const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral link');
    }
  };

  const handleItemAction = (item: ChecklistItem) => {
    if (item.id === 'referral') {
      copyReferralLink();
    } else if (item.route) {
      navigate(item.route);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const totalRewards = items.reduce((sum, item) => sum + item.reward, 0);
  const earnedRewards = items.filter(item => item.completed).reduce((sum, item) => sum + item.reward, 0);

  // Don't show if all items are completed or dismissed
  if (dismissed || (items.length > 0 && completedCount === items.length)) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted/20 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete these steps to unlock {totalRewards} bonus points
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {items.length} completed
              </span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                +{earnedRewards} pts earned
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    item.completed 
                      ? 'bg-green-500/10' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </span>
                      {item.reward > 0 && !item.completed && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          +{item.reward} pts
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  {!item.completed && item.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 h-8 text-xs"
                      onClick={() => handleItemAction(item)}
                    >
                      {item.id === 'referral' ? (
                        copiedReferral ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            {item.action}
                          </>
                        )
                      ) : (
                        <>
                          {item.action}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
