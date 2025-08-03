import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, AlertTriangle, CheckCircle, Cpu, Network, HardDrive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  diskUsage: number;
  onlineUsers: number;
  messageQueue: number;
  serverLoad: number;
}

interface MetricHistory {
  timestamp: string;
  latency: number;
  throughput: number;
  errorRate: number;
  onlineUsers: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    latency: 0,
    throughput: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    networkUsage: 0,
    diskUsage: 0,
    onlineUsers: 0,
    messageQueue: 0,
    serverLoad: 0
  });
  
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simulate real-time performance monitoring
  const generateMetrics = useCallback((): PerformanceMetrics => {
    const baseLatency = 50 + Math.random() * 100;
    const baseThroughput = 1000 + Math.random() * 500;
    const baseErrorRate = Math.random() * 2;
    
    return {
      latency: baseLatency,
      throughput: baseThroughput,
      errorRate: baseErrorRate,
      cpuUsage: 20 + Math.random() * 60,
      memoryUsage: 30 + Math.random() * 50,
      networkUsage: 10 + Math.random() * 40,
      diskUsage: 40 + Math.random() * 30,
      onlineUsers: Math.floor(20 + Math.random() * 100),
      messageQueue: Math.floor(Math.random() * 50),
      serverLoad: 0.3 + Math.random() * 0.7
    };
  }, []);

  // Check for performance alerts
  const checkAlerts = useCallback((newMetrics: PerformanceMetrics) => {
    const newAlerts: typeof alerts = [];
    
    if (newMetrics.latency > 200) {
      newAlerts.push({
        id: `latency-${Date.now()}`,
        type: 'warning',
        message: `High latency detected: ${newMetrics.latency.toFixed(0)}ms`,
        timestamp: new Date()
      });
    }
    
    if (newMetrics.errorRate > 1) {
      newAlerts.push({
        id: `error-${Date.now()}`,
        type: 'error',
        message: `Error rate elevated: ${newMetrics.errorRate.toFixed(1)}%`,
        timestamp: new Date()
      });
    }
    
    if (newMetrics.cpuUsage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        message: `High CPU usage: ${newMetrics.cpuUsage.toFixed(0)}%`,
        timestamp: new Date()
      });
    }
    
    if (newMetrics.memoryUsage > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `High memory usage: ${newMetrics.memoryUsage.toFixed(0)}%`,
        timestamp: new Date()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
      newAlerts.forEach(alert => {
        if (alert.type === 'error') {
          toast.error(alert.message);
        } else {
          toast.warning(alert.message);
        }
      });
    }
  }, []);

  // Store metrics in Supabase
  const storeMetrics = async (metrics: PerformanceMetrics) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase.from('performance_metrics').insert([
        {
          user_id: user.data.user.id,
          metric_name: 'latency',
          metric_value: metrics.latency,
          metadata: { unit: 'ms' }
        },
        {
          user_id: user.data.user.id,
          metric_name: 'throughput',
          metric_value: metrics.throughput,
          metadata: { unit: 'req/min' }
        },
        {
          user_id: user.data.user.id,
          metric_name: 'error_rate',
          metric_value: metrics.errorRate,
          metadata: { unit: '%' }
        },
        {
          user_id: user.data.user.id,
          metric_name: 'online_users',
          metric_value: metrics.onlineUsers,
          metadata: { unit: 'count' }
        }
      ]);
    } catch (error) {
      console.error('Error storing metrics:', error);
    }
  };

  // Update metrics periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newMetrics = generateMetrics();
      setMetrics(newMetrics);
      
      // Add to history
      const historyPoint: MetricHistory = {
        timestamp: new Date().toISOString(),
        latency: newMetrics.latency,
        throughput: newMetrics.throughput,
        errorRate: newMetrics.errorRate,
        onlineUsers: newMetrics.onlineUsers
      };
      
      setHistory(prev => [...prev.slice(-19), historyPoint]); // Keep last 20 points
      
      // Check for alerts
      checkAlerts(newMetrics);
      
      // Store metrics every 10th update (every 30 seconds)
      if (Math.random() < 0.1) {
        storeMetrics(newMetrics);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, generateMetrics, checkAlerts]);

  // Initialize monitoring
  useEffect(() => {
    setIsMonitoring(true);
    const initialMetrics = generateMetrics();
    setMetrics(initialMetrics);
  }, [generateMetrics]);

  const getStatusColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return <Badge variant="destructive">Critical</Badge>;
    if (value >= thresholds.warning) return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="default">Good</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
          {alerts.slice(0, 3).map(alert => (
            <Alert key={alert.id} className={
              alert.type === 'error' ? 'border-red-500' : 
              alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <span className="text-xs text-muted-foreground">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Latency</span>
              </div>
              {getStatusBadge(metrics.latency, { warning: 150, error: 200 })}
            </div>
            <p className={`text-2xl font-bold ${getStatusColor(metrics.latency, { warning: 150, error: 200 })}`}>
              {metrics.latency.toFixed(0)}ms
            </p>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        {/* Throughput */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              {getStatusBadge(2000 - metrics.throughput, { warning: 500, error: 800 })}
            </div>
            <p className="text-2xl font-bold text-green-500">
              {metrics.throughput.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Requests per minute</p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              {getStatusBadge(metrics.errorRate, { warning: 1, error: 2 })}
            </div>
            <p className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, { warning: 1, error: 2 })}`}>
              {metrics.errorRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Failed requests</p>
          </CardContent>
        </Card>

        {/* Online Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Online Users</span>
              </div>
              <Badge variant="outline">{metrics.onlineUsers}</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {metrics.onlineUsers}
            </p>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm">{metrics.cpuUsage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-sm">{metrics.memoryUsage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <span className="text-sm">{metrics.networkUsage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.networkUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm font-medium">Disk I/O</span>
              </div>
              <span className="text-sm">{metrics.diskUsage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.diskUsage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Latency & Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Latency (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Throughput (req/min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate & Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="errorRate" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Error Rate (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="onlineUsers" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Online Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};