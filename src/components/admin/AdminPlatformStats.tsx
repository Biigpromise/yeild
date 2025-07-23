
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  userLevels: Record<string, number>;
  totalPayouts: number;
  supportTickets: {
    open: number;
    inProgress: number;
    resolvedToday: number;
  };
}

export const AdminPlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    userLevels: { '1': 0, '2': 0, '3+': 0 },
    totalPayouts: 0,
    supportTickets: { open: 0, inProgress: 0, resolvedToday: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      setLoading(true);
      
      // Get user level distribution
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('level');

      if (profilesError) throw profilesError;

      const levelCounts = { '1': 0, '2': 0, '3+': 0 };
      profiles?.forEach(profile => {
        const level = profile.level || 1;
        if (level === 1) levelCounts['1']++;
        else if (level === 2) levelCounts['2']++;
        else levelCounts['3+']++;
      });

      // Get total payouts (sum of all withdrawal requests that are completed)
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('status', 'completed');

      if (withdrawalsError) throw withdrawalsError;

      const totalPayouts = withdrawals?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;

      // For support tickets, we'll use mock data since no support ticket system exists yet
      const supportTickets = {
        open: 0,
        inProgress: 0,
        resolvedToday: 0
      };

      setStats({
        userLevels: levelCounts,
        totalPayouts: totalPayouts * 0.01, // Convert points to dollars (assuming 100 points = $1)
        supportTickets
      });
    } catch (error) {
      console.error('Error loading platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">User Levels Distribution</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                <div>Level 1</div>
                <div className="text-sm text-muted-foreground">{stats.userLevels['1']} users</div>
              </div>
              <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                <div>Level 2</div>
                <div className="text-sm text-muted-foreground">{stats.userLevels['2']} users</div>
              </div>
              <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                <div>Level 3+</div>
                <div className="text-sm text-muted-foreground">{stats.userLevels['3+']} users</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Total Payouts</h4>
            <div className="text-3xl font-bold">${stats.totalPayouts.toFixed(2)}</div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Navigate to financial management
                window.dispatchEvent(new CustomEvent('navigateToFinancial'));
              }}
            >
              View All Payouts
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Support Tickets</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Open</span>
                <span className="font-medium">{stats.supportTickets.open}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Progress</span>
                <span className="font-medium">{stats.supportTickets.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolved Today</span>
                <span className="font-medium">{stats.supportTickets.resolvedToday}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Navigate to support section
                window.dispatchEvent(new CustomEvent('navigateToSupport'));
              }}
            >
              Manage Tickets
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
