import React, { useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BarChart3, 
  Settings, 
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { BrandTaskManager } from '@/components/brand/BrandTaskManager';
import { BrandAnalyticsTab } from '@/components/brand/BrandAnalyticsTab';
import { BrandProfileTab } from '@/components/brand/BrandProfileTab';
import { TaskSubmissionReview } from '@/components/brand/TaskSubmissionReview';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

const BrandPortal = () => {
  const { role, loading } = useRole();
  const [activeTab, setActiveTab] = useState('tasks');

  // Mock data for dashboard stats
  const stats = {
    activeTasks: 12,
    pendingSubmissions: 23,
    completedTasks: 45,
    totalSpent: 8450,
    averageROI: 245
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <RoleProtectedRoute requiredRole="brand">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Brand Portal</h1>
                <p className="text-muted-foreground mt-1">
                  Create tasks, track performance, and manage your campaigns
                </p>
              </div>
              <Button size="lg" onClick={() => setActiveTab('tasks')}>
                <Plus className="h-5 w-5 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activeTasks}</p>
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingSubmissions}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completedTasks}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.averageROI}%</p>
                    <p className="text-sm text-muted-foreground">Average ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Task Management
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Submissions
                {stats.pendingSubmissions > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pendingSubmissions}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <BrandTaskManager />
            </TabsContent>

            <TabsContent value="submissions">
              <TaskSubmissionReview />
            </TabsContent>

            <TabsContent value="analytics">
              <BrandAnalyticsTab />
            </TabsContent>

            <TabsContent value="profile">
              <BrandProfileTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default BrandPortal;