
import React, { useState, useEffect } from "react";
import { AdminSystemMetrics } from "./AdminSystemMetrics";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminDashboardStatsComponent } from "./AdminDashboardStats";
import { AdminUserActions } from "./AdminUserActions";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminTaskOverview } from "./AdminTaskOverview";
import { AdminPlatformStats } from "./AdminPlatformStats";
import { BirdLevelManagementDialog } from "./BirdLevelManagementDialog";
import { EnhancedUserManagementSystem } from "./enhanced/EnhancedUserManagementSystem";
import { SecurityMonitoring } from "./SecurityMonitoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bird, Crown, AlertTriangle, Shield, Users } from "lucide-react";
import { integratedFraudDetectionService, FraudDetectionStats } from "@/services/integratedFraudDetectionService";
import { supabase } from "@/integrations/supabase/client";

interface BirdStats {
  phoenixCount: number;
  falconCount: number; 
  eagleCount: number;
  totalActiveReferrals: number;
}

export const AdminOverview = () => {
  const [fraudStats, setFraudStats] = useState<FraudDetectionStats | null>(null);
  const [birdManagementOpen, setBirdManagementOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [birdStats, setBirdStats] = useState<BirdStats>({
    phoenixCount: 0,
    falconCount: 0,
    eagleCount: 0,
    totalActiveReferrals: 0
  });

  useEffect(() => {
    const loadFraudStats = async () => {
      const stats = await integratedFraudDetectionService.getFraudDetectionStats();
      setFraudStats(stats);
    };

    const loadBirdStats = async () => {
      try {
        // Get users with their active referrals count and points
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('active_referrals_count, points');

        if (error) throw error;

        let phoenixCount = 0;
        let falconCount = 0;
        let eagleCount = 0;
        let totalActiveReferrals = 0;

        profiles?.forEach(profile => {
          const referrals = profile.active_referrals_count || 0;
          const points = profile.points || 0;
          totalActiveReferrals += referrals;

          // Determine bird level based on referrals and points
          if (referrals >= 1000 && points >= 25000) {
            phoenixCount++;
          } else if (referrals >= 500 && points >= 12500) {
            falconCount++;
          } else if (referrals >= 100 && points >= 2500) {
            eagleCount++;
          }
        });

        setBirdStats({
          phoenixCount,
          falconCount,
          eagleCount,
          totalActiveReferrals
        });
      } catch (error) {
        console.error('Error loading bird stats:', error);
      }
    };

    loadFraudStats();
    loadBirdStats();
    
    // Check for new fraud alerts
    integratedFraudDetectionService.checkForNewFraudAlerts();
  }, []);

  const { phoenixCount, falconCount, eagleCount, totalActiveReferrals } = birdStats;

  if (showUserManagement) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Button variant="outline" onClick={() => setShowUserManagement(false)}>
            Back to Overview
          </Button>
        </div>
        <EnhancedUserManagementSystem />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real Dashboard Stats */}
      <AdminDashboardStatsComponent />

      {/* Quick Access to User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => setShowUserManagement(true)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" onClick={() => setBirdManagementOpen(true)}>
              <Bird className="h-4 w-4 mr-2" />
              Bird Levels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Detection Stats */}
      {fraudStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Fraud Detection Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{fraudStats.totalFlags}</div>
                <div className="text-sm text-red-700">Total Flags</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{fraudStats.pendingFlags}</div>
                <div className="text-sm text-yellow-700">Pending Review</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{fraudStats.highSeverityFlags}</div>
                <div className="text-sm text-orange-700">High Severity</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{fraudStats.duplicateReferrals}</div>
                <div className="text-sm text-purple-700">Duplicate Referrals</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{fraudStats.duplicateImages}</div>
                <div className="text-sm text-blue-700">Duplicate Images</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Comprehensive fraud detection system monitoring referrals, images, and user behavior
              </p>
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View All Fraud Flags
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bird Badge System Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bird className="h-5 w-5" />
            Bird Badge System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{phoenixCount}</div>
              <div className="text-sm text-blue-700">Phoenix Birds</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{falconCount}</div>
              <div className="text-sm text-purple-700">Falcon Birds</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{eagleCount}</div>
              <div className="text-sm text-amber-700">Eagle Birds</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalActiveReferrals}</div>
              <div className="text-sm text-green-700">Active Referrals</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Bird badge statistics require database setup for real-time tracking
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setBirdManagementOpen(true)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Manage Bird Levels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <AdminSystemMetrics />

      {/* User Management Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Management</h3>
        <AdminUserActions />
      </div>

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* User Management and Task Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <AdminRecentActivity />

        {/* Task Management */}
        <AdminTaskOverview />
      </div>

      {/* Platform Statistics */}
      <AdminPlatformStats />

      {/* Bird Level Management Dialog */}
      <BirdLevelManagementDialog 
        open={birdManagementOpen}
        onOpenChange={setBirdManagementOpen}
      />
    </div>
  );
};
