import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, Activity, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { adminVerification } from '@/utils/adminVerification';

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'admin_action' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_id?: string;
  ip_address?: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_resource: string;
  details: any;
  timestamp: string;
  admin_email?: string;
}

export const SecurityMonitoring = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    setupRealTimeMonitoring();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Load recent security alerts from activity logs
      const { data: activityLogs, error: logsError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('action', 'security_event')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Transform activity logs to security alerts
      const securityAlerts: SecurityAlert[] = activityLogs?.map(log => {
        const details = log.details as any;
        return {
          id: log.id,
          type: details?.event_type || 'suspicious_activity',
          severity: details?.severity || 'medium',
          message: details?.details?.message || 'Security event detected',
          user_id: log.user_id,
          ip_address: log.ip_address as string,
          timestamp: log.created_at,
          acknowledged: false
        };
      }) || [];

      setAlerts(securityAlerts);

      // Load admin actions
      const { data: adminLogs, error: adminError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .like('action', '%admin%')
        .order('created_at', { ascending: false })
        .limit(30);

      if (adminError) throw adminError;

      const adminActions: AdminAction[] = adminLogs?.map(log => {
        const details = log.details as any;
        return {
          id: log.id,
          admin_id: log.user_id,
          action_type: log.action,
          target_resource: details?.target || 'unknown',
          details: details,
          timestamp: log.created_at,
          admin_email: 'Admin User'
        };
      }) || [];

      setAdminActions(adminActions);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeMonitoring = () => {
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity_logs',
          filter: 'action=eq.security_event'
        },
        (payload) => {
          const details = payload.new.details as any;
          const newAlert: SecurityAlert = {
            id: payload.new.id,
            type: details?.event_type || 'suspicious_activity',
            severity: details?.severity || 'medium',
            message: details?.details?.message || 'New security event',
            user_id: payload.new.user_id,
            ip_address: payload.new.ip_address as string,
            timestamp: payload.new.created_at,
            acknowledged: false
          };

          setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
          
          // Show toast for high/critical alerts
          if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
            toast({
              title: "🚨 Security Alert",
              description: newAlert.message,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const grantAdminAccess = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await adminVerification.grantAdminAccess(newAdminEmail);
      if (success) {
        setNewAdminEmail('');
        // Log the admin action
        await supabase.rpc('log_security_event', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'admin_granted',
          event_details: { target_email: newAdminEmail }
        });
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <Lock className="h-4 w-4" />;
      case 'data_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'admin_action': return <Shield className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security Monitoring</h2>
        <Button onClick={loadSecurityData} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => !a.acknowledged).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminActions.filter(a => 
                new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          <TabsTrigger value="access">Access Management</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground">No security alerts found.</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.acknowledged ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1">{alert.message}</p>
                            {alert.ip_address && (
                              <p className="text-sm text-muted-foreground">
                                IP: {alert.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminActions.length === 0 ? (
                  <p className="text-muted-foreground">No admin actions found.</p>
                ) : (
                  adminActions.map((action) => (
                    <div key={action.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{action.action_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(action.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1">
                            <strong>{action.admin_email || 'Unknown Admin'}</strong>{' '}
                            performed action on <strong>{action.target_resource}</strong>
                          </p>
                          {action.details && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                              {JSON.stringify(action.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Grant Admin Access</Label>
                <div className="flex space-x-2">
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                  <Button onClick={grantAdminAccess} disabled={loading}>
                    Grant Access
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will grant admin role to the specified user. Use with caution.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Security Recommendations</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Enable 2FA for all admin accounts</li>
                  <li>• Regularly review admin access logs</li>
                  <li>• Monitor for unusual login patterns</li>
                  <li>• Keep admin list minimal and up-to-date</li>
                  <li>• Use strong, unique passwords</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};