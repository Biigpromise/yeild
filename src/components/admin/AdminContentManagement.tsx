
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Settings, Globe, Megaphone, Database } from "lucide-react";

export const AdminContentManagement = () => {
  const [platformSettings, setPlatformSettings] = useState({
    siteName: "YEILD",
    maintenanceMode: false,
    registrationEnabled: true,
    taskSubmissionEnabled: true,
    withdrawalEnabled: true,
    maxTasksPerUser: 10,
    pointsPerTask: 50
  });

  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    targetAudience: 'all' as 'all' | 'active' | 'new' | 'inactive'
  });

  const [contentPolicy, setContentPolicy] = useState({
    autoApproval: false,
    moderationRequired: true,
    bannedWords: '',
    maxSubmissionSize: 5,
    allowedFileTypes: 'jpg,png,pdf,doc'
  });

  const handleSaveSettings = () => {
    console.log('Saving platform settings:', platformSettings);
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully.",
    });
  };

  const handleBroadcastAnnouncement = () => {
    if (!announcement.title || !announcement.content) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    console.log('Broadcasting announcement:', announcement);
    toast({
      title: "Announcement Sent",
      description: `Announcement broadcasted to ${announcement.targetAudience} users.`,
    });
    
    setAnnouncement({
      title: '',
      content: '',
      type: 'info',
      targetAudience: 'all'
    });
  };

  const handleSaveContentPolicy = () => {
    console.log('Saving content policy:', contentPolicy);
    toast({
      title: "Content Policy Updated",
      description: "Content moderation settings have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformSettings.maintenanceMode ? 'Maintenance' : 'Online'}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformSettings.maintenanceMode ? 'Site under maintenance' : 'All systems operational'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformSettings.registrationEnabled ? 'Open' : 'Closed'}
            </div>
            <p className="text-xs text-muted-foreground">New user signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Submissions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformSettings.taskSubmissionEnabled ? 'Active' : 'Paused'}
            </div>
            <p className="text-xs text-muted-foreground">User submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformSettings.withdrawalEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">Point withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="content">Content Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={platformSettings.siteName}
                      onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch
                      id="maintenance"
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">Registration Enabled</Label>
                    <Switch
                      id="registration"
                      checked={platformSettings.registrationEnabled}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, registrationEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="submissions">Task Submissions</Label>
                    <Switch
                      id="submissions"
                      checked={platformSettings.taskSubmissionEnabled}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, taskSubmissionEnabled: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="withdrawals">Withdrawals Enabled</Label>
                    <Switch
                      id="withdrawals"
                      checked={platformSettings.withdrawalEnabled}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, withdrawalEnabled: checked})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxTasks">Max Tasks per User</Label>
                    <Input
                      id="maxTasks"
                      type="number"
                      value={platformSettings.maxTasksPerUser}
                      onChange={(e) => setPlatformSettings({...platformSettings, maxTasksPerUser: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pointsPerTask">Default Points per Task</Label>
                    <Input
                      id="pointsPerTask"
                      type="number"
                      value={platformSettings.pointsPerTask}
                      onChange={(e) => setPlatformSettings({...platformSettings, pointsPerTask: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Announcement title"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                />
                <Select
                  value={announcement.type}
                  onValueChange={(value: any) => setAnnouncement({...announcement, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Announcement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select
                value={announcement.targetAudience}
                onValueChange={(value: any) => setAnnouncement({...announcement, targetAudience: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="new">New Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Announcement content"
                value={announcement.content}
                onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                rows={6}
              />

              <Button onClick={handleBroadcastAnnouncement} className="w-full">
                <Megaphone className="h-4 w-4 mr-2" />
                Broadcast Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoApproval">Auto-approve submissions</Label>
                    <Switch
                      id="autoApproval"
                      checked={contentPolicy.autoApproval}
                      onCheckedChange={(checked) => setContentPolicy({...contentPolicy, autoApproval: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="moderation">Require manual moderation</Label>
                    <Switch
                      id="moderation"
                      checked={contentPolicy.moderationRequired}
                      onCheckedChange={(checked) => setContentPolicy({...contentPolicy, moderationRequired: checked})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxSize">Max submission size (MB)</Label>
                    <Input
                      id="maxSize"
                      type="number"
                      value={contentPolicy.maxSubmissionSize}
                      onChange={(e) => setContentPolicy({...contentPolicy, maxSubmissionSize: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fileTypes">Allowed file types</Label>
                    <Input
                      id="fileTypes"
                      placeholder="jpg,png,pdf,doc"
                      value={contentPolicy.allowedFileTypes}
                      onChange={(e) => setContentPolicy({...contentPolicy, allowedFileTypes: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bannedWords">Banned words (comma-separated)</Label>
                    <Textarea
                      id="bannedWords"
                      placeholder="Enter banned words separated by commas"
                      value={contentPolicy.bannedWords}
                      onChange={(e) => setContentPolicy({...contentPolicy, bannedWords: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveContentPolicy} className="w-full">
                Save Content Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
