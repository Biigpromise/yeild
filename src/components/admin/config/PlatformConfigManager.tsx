
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Shield, 
  Globe, 
  Zap, 
  Bell, 
  DollarSign,
  Users,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { adminContentService, PlatformSettings } from '@/services/admin/adminContentService';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'feature' | 'security' | 'performance' | 'ui';
}

interface SystemConfig {
  apiRateLimit: number;
  maxFileSize: number;
  sessionTimeout: number;
  backupFrequency: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const PlatformConfigManager: React.FC = () => {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadConfigData();
  }, []);

  const loadConfigData = async () => {
    try {
      setLoading(true);
      const settings = await adminContentService.getPlatformSettings();
      setPlatformSettings(settings);

      // Mock feature flags
      const mockFeatureFlags: FeatureFlag[] = [
        {
          id: '1',
          name: 'Advanced Analytics',
          description: 'Enable advanced analytics dashboard',
          enabled: true,
          category: 'feature'
        },
        {
          id: '2',
          name: 'Two-Factor Authentication',
          description: 'Require 2FA for all users',
          enabled: false,
          category: 'security'
        },
        {
          id: '3',
          name: 'Real-time Notifications',
          description: 'Enable real-time push notifications',
          enabled: true,
          category: 'feature'
        },
        {
          id: '4',
          name: 'Image Compression',
          description: 'Automatically compress uploaded images',
          enabled: true,
          category: 'performance'
        }
      ];

      setFeatureFlags(mockFeatureFlags);

      // Mock system config
      setSystemConfig({
        apiRateLimit: 100,
        maxFileSize: 10,
        sessionTimeout: 30,
        backupFrequency: 'daily',
        logLevel: 'info'
      });
    } catch (error) {
      console.error('Error loading config data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!platformSettings) return;

    try {
      setSaving(true);
      await adminContentService.updatePlatformSettings(platformSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureFlagToggle = (flagId: string, enabled: boolean) => {
    setFeatureFlags(prev =>
      prev.map(flag =>
        flag.id === flagId ? { ...flag, enabled } : flag
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-500';
      case 'security': return 'bg-red-500';
      case 'performance': return 'bg-green-500';
      case 'ui': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading platform configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Configuration</h2>
          <p className="text-muted-foreground">Manage system settings and feature flags</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={platformSettings?.siteName || ''}
                    onChange={(e) => setPlatformSettings(prev => 
                      prev ? { ...prev, siteName: e.target.value } : null
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access to the platform
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings?.maintenanceMode || false}
                    onCheckedChange={(checked) => setPlatformSettings(prev =>
                      prev ? { ...prev, maintenanceMode: checked } : null
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings?.registrationEnabled || false}
                    onCheckedChange={(checked) => setPlatformSettings(prev =>
                      prev ? { ...prev, registrationEnabled: checked } : null
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-tasks">Max Tasks Per User</Label>
                  <Input
                    id="max-tasks"
                    type="number"
                    value={platformSettings?.maxTasksPerUser || 0}
                    onChange={(e) => setPlatformSettings(prev =>
                      prev ? { ...prev, maxTasksPerUser: parseInt(e.target.value) } : null
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="points-per-task">Points Per Task</Label>
                  <Input
                    id="points-per-task"
                    type="number"
                    value={platformSettings?.pointsPerTask || 0}
                    onChange={(e) => setPlatformSettings(prev =>
                      prev ? { ...prev, pointsPerTask: parseInt(e.target.value) } : null
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Withdrawals Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to withdraw earnings
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings?.withdrawalEnabled || false}
                    onCheckedChange={(checked) => setPlatformSettings(prev =>
                      prev ? { ...prev, withdrawalEnabled: checked } : null
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{flag.name}</h4>
                        <Badge className={getCategoryColor(flag.category)}>
                          {flag.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) => handleFeatureFlagToggle(flag.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Changes to security settings will affect all users immediately.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={systemConfig?.sessionTimeout || 0}
                  onChange={(e) => setSystemConfig(prev =>
                    prev ? { ...prev, sessionTimeout: parseInt(e.target.value) } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  value={systemConfig?.apiRateLimit || 0}
                  onChange={(e) => setSystemConfig(prev =>
                    prev ? { ...prev, apiRateLimit: parseInt(e.target.value) } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={systemConfig?.maxFileSize || 0}
                  onChange={(e) => setSystemConfig(prev =>
                    prev ? { ...prev, maxFileSize: parseInt(e.target.value) } : null
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  className="w-full p-2 border rounded"
                  value={systemConfig?.backupFrequency || 'daily'}
                  onChange={(e) => setSystemConfig(prev =>
                    prev ? { ...prev, backupFrequency: e.target.value } : null
                  )}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="log-level">Log Level</Label>
                <select
                  id="log-level"
                  className="w-full p-2 border rounded"
                  value={systemConfig?.logLevel || 'info'}
                  onChange={(e) => setSystemConfig(prev =>
                    prev ? { ...prev, logLevel: e.target.value as any } : null
                  )}
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification Configuration</h3>
                <p className="text-muted-foreground">
                  Advanced notification settings and templates coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
