import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Activity, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { securityConfigService } from '@/services/security/securityConfigService';

interface SecurityMetrics {
  totalEvents: number;
  last24Hours: number;
  criticalEvents: number;
  highEvents: number;
  recentEvents: any[];
}

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityMetrics();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);
      const data = await securityConfigService.getSecurityMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading security metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load security metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enablePasswordSecurity = async () => {
    try {
      const success = await securityConfigService.enablePasswordSecurity();
      if (success) {
        toast({
          title: "Success",
          description: "Password security features enabled",
          variant: "default"
        });
      } else {
        throw new Error('Failed to enable password security');
      }
    } catch (error) {
      console.error('Error enabling password security:', error);
      toast({
        title: "Error",
        description: "Failed to enable password security features",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
        <Button onClick={loadSecurityMetrics} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.last24Hours || 0}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics?.criticalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics?.highEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Needs review</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password Security</h4>
              <p className="text-sm text-muted-foreground">
                Enable password strength validation and breach detection
              </p>
            </div>
            <Button onClick={enablePasswordSecurity} variant="outline">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.recentEvents?.length ? (
            <div className="space-y-2">
              {metrics.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <span className="font-medium">{event.event_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    User: {event.user_id?.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent security events
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};