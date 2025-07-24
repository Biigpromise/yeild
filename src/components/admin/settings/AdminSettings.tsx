
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Bell, 
  Database,
  Palette,
  Globe,
  Lock
} from "lucide-react";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'YieldSocials',
    platformDescription: 'Social media task platform',
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // Payment Settings
    platformFeePercent: 5,
    minimumWithdrawal: 1000,
    paymentGateway: 'flutterwave',
    autoApproveWithdrawals: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    systemAlerts: true,
    
    // Content Settings
    autoModeratePosts: true,
    requireTaskApproval: true,
    maxFileUploadSize: 10,
    allowedFileTypes: 'jpg,png,gif,mp4'
  });

  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleResetSection = (section: string) => {
    toast.info(`${section} settings reset to defaults`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="platformDescription">Platform Description</Label>
                  <Input
                    id="platformDescription"
                    value={settings.platformDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, platformDescription: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="registrationEnabled">User Registration</Label>
                  <Switch
                    id="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleSaveSettings('General')}>Save Changes</Button>
                  <Button variant="outline" onClick={() => handleResetSection('General')}>Reset</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Theme customization coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">New users must verify their email</p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSaveSettings('Security')}>Save Changes</Button>
                <Button variant="outline" onClick={() => handleResetSection('Security')}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformFeePercent">Platform Fee (%)</Label>
                  <Input
                    id="platformFeePercent"
                    type="number"
                    value={settings.platformFeePercent}
                    onChange={(e) => setSettings(prev => ({ ...prev, platformFeePercent: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="minimumWithdrawal">Minimum Withdrawal (₦)</Label>
                  <Input
                    id="minimumWithdrawal"
                    type="number"
                    value={settings.minimumWithdrawal}
                    onChange={(e) => setSettings(prev => ({ ...prev, minimumWithdrawal: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentGateway">Payment Gateway</Label>
                <Select 
                  value={settings.paymentGateway} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, paymentGateway: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                    <SelectItem value="paystack">Paystack</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoApproveWithdrawals">Auto-approve Withdrawals</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve withdrawal requests</p>
                </div>
                <Switch
                  id="autoApproveWithdrawals"
                  checked={settings.autoApproveWithdrawals}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApproveWithdrawals: checked }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSaveSettings('Payment')}>Save Changes</Button>
                <Button variant="outline" onClick={() => handleResetSection('Payment')}>Reset</Button>
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
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Send promotional emails</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical system notifications</p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSaveSettings('Notification')}>Save Changes</Button>
                <Button variant="outline" onClick={() => handleResetSection('Notification')}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoModeratePosts">Auto-moderate Posts</Label>
                    <p className="text-sm text-muted-foreground">Automatically filter inappropriate content</p>
                  </div>
                  <Switch
                    id="autoModeratePosts"
                    checked={settings.autoModeratePosts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoModeratePosts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireTaskApproval">Require Task Approval</Label>
                    <p className="text-sm text-muted-foreground">All tasks need admin approval</p>
                  </div>
                  <Switch
                    id="requireTaskApproval"
                    checked={settings.requireTaskApproval}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireTaskApproval: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileUploadSize"
                    type="number"
                    value={settings.maxFileUploadSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileUploadSize: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                    placeholder="jpg,png,gif,mp4"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSaveSettings('Content')}>Save Changes</Button>
                <Button variant="outline" onClick={() => handleResetSection('Content')}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Advanced system settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
