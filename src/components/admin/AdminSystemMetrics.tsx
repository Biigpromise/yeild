
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

export const AdminSystemMetrics = () => {
  const systemMetrics = {
    serverUptime: "99.98%",
    activeUsers: 1247,
    databaseSize: "2.4 GB",
    apiCalls: 12453,
    errorRate: "0.02%",
    responseTime: "145ms"
  };

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      message: "High API usage detected",
      time: "2 hours ago",
      resolved: false
    },
    {
      id: 2,
      type: "info",
      message: "Database backup completed",
      time: "6 hours ago",
      resolved: true
    },
    {
      id: 3,
      type: "error",
      message: "Payment gateway timeout",
      time: "1 day ago",
      resolved: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.serverUptime}</div>
            <Progress value={99.98} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.databaseSize}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.3GB this week
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Calls (24h)</span>
              <span className="font-bold">{systemMetrics.apiCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <Badge variant="outline" className="text-green-600">
                {systemMetrics.errorRate}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Response Time</span>
              <Badge variant="outline" className="text-blue-600">
                {systemMetrics.responseTime}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md border">
                  {alert.type === "error" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  {alert.type === "warning" && <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {alert.type === "info" && <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  <Badge variant={alert.resolved ? "default" : "destructive"} className="text-xs">
                    {alert.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
