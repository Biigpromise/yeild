
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminContentService, PlatformSettings } from "@/services/admin/adminContentService";
import { Settings, AlertTriangle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const PlatformConfigManager = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "YEILD",
    maintenanceMode: false,
    registrationEnabled: true,
    taskSubmissionEnabled: true,
    withdrawalEnabled: true,
    maxTasksPerUser: 10,
    pointsPerTask: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminContentService.getPlatformSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminContentService.updatePlatformSettings(settings);
      toast({
        title: "Success",
        description: "Platform settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update platform settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async (enabled: boolean) => {
    const success = await adminContentService.toggleMaintenanceMode(enabled);
    if (success) {
      setSettings({...settings, maintenanceMode: enabled});
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6">
      {settings.maintenanceMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Maintenance mode is currently active. Users may have limited access to the platform.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="Enter site name"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">System Controls</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the platform in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={handleMaintenanceToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, registrationEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to submit tasks
                  </p>
                </div>
                <Switch
                  checked={settings.taskSubmissionEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, taskSubmissionEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Withdrawals</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to withdraw points
                  </p>
                </div>
                <Switch
                  checked={settings.withdrawalEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, withdrawalEnabled: checked})}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Task Limits</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxTasks">Max Tasks per User</Label>
                  <Input
                    id="maxTasks"
                    type="number"
                    value={settings.maxTasksPerUser}
                    onChange={(e) => setSettings({...settings, maxTasksPerUser: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="pointsPerTask">Default Points per Task</Label>
                  <Input
                    id="pointsPerTask"
                    type="number"
                    value={settings.pointsPerTask}
                    onChange={(e) => setSettings({...settings, pointsPerTask: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
