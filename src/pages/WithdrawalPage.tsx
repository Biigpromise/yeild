import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ModernWithdrawalHeader } from '@/components/withdrawal/ModernWithdrawalHeader';
import { WithdrawalWizard } from '@/components/withdrawal/WithdrawalWizard';
import { QuickActionPanel } from '@/components/withdrawal/QuickActionPanel';

const WithdrawalPage = () => {
  const { user } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load user balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      setUserBalance(profileData?.points || 0);
      
      // Calculate total earned from withdrawal history (mock calculation)
      const totalEarnedAmount = profileData?.points || 0;
      setTotalEarned(totalEarnedAmount * 1.2); // Mock 20% more than current balance

      // Load pending withdrawals count
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (!withdrawalError) {
        setPendingWithdrawals(withdrawalData?.length || 0);
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const handleQuickWithdraw = (method: string) => {
    setShowWizard(true);
  };

  const handleWithdrawalSubmitted = () => {
    setShowWizard(false);
    loadUserData(); // Refresh all data
    toast.success('Withdrawal completed successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <ModernWithdrawalHeader 
          userBalance={userBalance}
          totalEarned={totalEarned}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
        />

        {/* Main Content */}
        <div className="px-4 pb-8">
          {showWizard ? (
            <div className="max-w-4xl mx-auto">
              <WithdrawalWizard
                userBalance={userBalance}
                onWithdrawalSubmitted={handleWithdrawalSubmitted}
              />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Quick Actions Sidebar */}
              <div className="lg:col-span-1">
                <QuickActionPanel
                  userBalance={userBalance}
                  pendingWithdrawals={pendingWithdrawals}
                  onQuickWithdraw={handleQuickWithdraw}
                />
              </div>

              {/* Main Withdrawal Area */}
              <div className="lg:col-span-2">
                <WithdrawalWizard
                  userBalance={userBalance}
                  onWithdrawalSubmitted={handleWithdrawalSubmitted}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;