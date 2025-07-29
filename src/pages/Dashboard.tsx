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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Target, 
  Wallet, 
  Users, 
  Gift,
  User,
  Heart,
  BookOpen,
  Settings,
  Bell,
  LogOut
} from "lucide-react";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SocialTab } from "@/components/dashboard/SocialTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { ProfileEditModal } from "@/components/dashboard/ProfileEditModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { userProfile, userStats, loading, error, loadUserData } = useDashboard();
  const [unreadCount, setUnreadCount] = useState(0);

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
            <Button onClick={() => loadUserData()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-onboarding="dashboard">
      <EmailConfirmationBanner />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              data-onboarding="profile"
            >
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                <AvatarImage 
                  src={userProfile?.profile_picture_url || user?.user_metadata?.avatar_url} 
                  alt="Profile picture" 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0])?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">YIELD</h1>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {(userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0])?.slice(0, 15)}{(userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0])?.length > 15 ? '...' : ''}!
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="grid grid-cols-3 gap-6 sm:gap-8 text-center" data-onboarding="leaderboard">
              <div className="min-w-0 px-1 flex-1">
                <div className="text-lg sm:text-xl font-bold text-warning leading-tight">{userStats?.points || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Points</div>
              </div>
              <div className="min-w-0 px-1 flex-1">
                <div className="text-lg sm:text-xl font-bold text-primary leading-tight">{userStats?.level || 1}</div>
                <div className="text-xs text-muted-foreground font-medium">Level</div>
              </div>
              <div className="min-w-0 px-1 flex-1">
                <div className="text-lg sm:text-xl font-bold text-green-500 leading-tight">{userStats?.tasksCompleted || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Tasks</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white hover:bg-red-600"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <NotificationCenter onUnreadCountChange={setUnreadCount} />
                </PopoverContent>
              </Popover>
              
              <Button 
                onClick={handleSignOut}
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
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
            <TabsTrigger value="tasks" className="flex items-center gap-2" data-onboarding="tasks">
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
            <TabsTrigger value="referral" className="flex items-center gap-2" data-onboarding="referrals">
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
      
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={loadUserData}
      />
    </div>
  );
}
