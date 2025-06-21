
import React, { useState, useEffect } from "react";
import { AdminSystemMetrics } from "./AdminSystemMetrics";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminDashboardStatsComponent } from "./AdminDashboardStats";
import { AdminUserActions } from "./AdminUserActions";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminTaskOverview } from "./AdminTaskOverview";
import { AdminPlatformStats } from "./AdminPlatformStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bird, Crown, AlertTriangle, Shield } from "lucide-react";
import { integratedFraudDetectionService, FraudDetectionStats } from "@/services/integratedFraudDetectionService";

export const AdminOverview = () => {
  const [fraudStats, setFraudStats] = useState<FraudDetectionStats | null>(null);

  useEffect(() => {
    const loadFraudStats = async () => {
      const stats = await integratedFraudDetectionService.getFraudDetectionStats();
      setFraudStats(stats);
    };

    loadFraudStats();
    
    // Check for new fraud alerts
    integratedFraudDetectionService.checkForNewFraudAlerts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Real Dashboard Stats */}
      <AdminDashboardStatsComponent />

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
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-700">Phoenix Birds</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-700">Falcon Birds</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">0</div>
              <div className="text-sm text-amber-700">Eagle Birds</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-700">Active Referrals</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Bird badge statistics require database setup for real-time tracking
            </p>
            <Button variant="outline" size="sm">
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
    </div>
  );
};
