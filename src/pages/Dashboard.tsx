import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { toast } from "sonner";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { StatsDashboard } from "@/components/StatsDashboard";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Target, 
  Wallet, 
  Users, 
  Gift,
  User,
  Heart,
  BookOpen,
  Settings
} from "lucide-react";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SocialTab } from "@/components/dashboard/SocialTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { userProfile, userStats, loading, error } = useDashboard();

  const handleSignOut = async () => {
    try {
      console.log('Signing out user');
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EmailConfirmationBanner />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Welcome back, {userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0]}!
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">{userStats?.points || 0}</span>
                <span className="text-muted-foreground">points</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="font-medium">Level {userStats?.level || 1}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Referral</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsDashboard userStats={userStats ? {
              points: userStats.points,
              level: userStats.level.toString(),
              tasksCompleted: userStats.tasksCompleted
            } : undefined} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TasksTab />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialTab />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletTab />
          </TabsContent>

          <TabsContent value="referral" className="space-y-6">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
