
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Bell, Shield, LogOut, Palette, Monitor, Moon, Sun, BellRing, BellOff } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isSupported, isEnabled, permission, requestPermission, disableNotifications } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Profile update feature coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={user?.user_metadata?.name || ''}
              placeholder="Your full name"
            />
          </div>
          <Button onClick={handleUpdateProfile} className="w-full">
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Push Notifications</Label>
                {isEnabled ? (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                    <BellRing className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    <BellOff className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when new tasks are available
              </p>
              {!isSupported && (
                <p className="text-xs text-amber-600">
                  Push notifications are not supported in this browser
                </p>
              )}
              {permission === 'denied' && (
                <p className="text-xs text-destructive">
                  Notifications blocked. Enable in browser settings.
                </p>
              )}
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await requestPermission();
                } else {
                  disableNotifications();
                }
              }}
              disabled={!isSupported || permission === 'denied'}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summaries and important updates
              </p>
            </div>
            <Switch
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose between light and dark themes, or follow your system setting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
          <Button variant="outline" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {loading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
