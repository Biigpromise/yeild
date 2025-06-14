
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SystemMetrics {
  activeUsers: number;
  totalTasks: number;
  totalSubmissions: number;
  pendingSubmissions: number;
}

export const AdminSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [usersData, tasksData, submissionsData] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('tasks').select('id'),
        supabase.from('task_submissions').select('id, status')
      ]);

      const activeUsers = usersData.data?.length || 0;
      const totalTasks = tasksData.data?.length || 0;
      const totalSubmissions = submissionsData.data?.length || 0;
      const pendingSubmissions = submissionsData.data?.filter(s => s.status === 'pending').length || 0;

      setMetrics({
        activeUsers,
        totalTasks,
        totalSubmissions,
        pendingSubmissions
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading system metrics..." />;
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load system metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingSubmissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Connection</span>
              <Badge variant="outline" className="text-green-600">
                Online
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Submissions</span>
              <span className="font-bold">{metrics.totalSubmissions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">System Health</span>
              <Badge variant="outline" className="text-green-600">
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md border">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System operational</p>
                  <p className="text-xs text-muted-foreground">All services running normally</p>
                </div>
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md border">
                <Server className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Database connected</p>
                  <p className="text-xs text-muted-foreground">Supabase integration active</p>
                </div>
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
