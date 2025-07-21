
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { CommunityTab } from "@/components/dashboard/CommunityTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";
import { ChatTab } from "@/components/dashboard/ChatTab";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { BirdStatusDisplay } from "@/components/bird/BirdStatusDisplay";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceLevel } from '@/hooks/useExperienceLevel';
import { useDashboard } from '@/hooks/useDashboard';
import { useReferralMonitoring } from '@/hooks/useReferralMonitoring';

const Dashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const { showOnboarding, userType, completeOnboarding } = useOnboarding();
    const dashboardData = useDashboard();
    
    // Monitor referral activation with enhanced monitoring
    const { referralStats } = useReferralMonitoring();
    
    // Mock user stats for experience level calculation
    const { isFeatureUnlocked } = useExperienceLevel(0, 0, 0);
    
    // Get user's display name with enhanced fallbacks and debugging
    const getUserDisplayName = () => {
        console.log('Getting user display name. User data:', {
            profile_name: dashboardData.userProfile?.name,
            meta_full_name: user?.user_metadata?.full_name,
            meta_name: user?.user_metadata?.name,
            email: user?.email
        });

        // Priority order for name display
        if (dashboardData.userProfile?.name?.trim()) {
            return dashboardData.userProfile.name.trim();
        }
        if (user?.user_metadata?.full_name?.trim()) {
            return user.user_metadata.full_name.trim();
        }
        if (user?.user_metadata?.name?.trim()) {
            return user.user_metadata.name.trim();
        }
        if (user?.email) {
            // Extract name from email before @ symbol and capitalize
            const emailName = user.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return 'YEILDer';
    };

    // Get greeting message based on time of day
    const getGreetingMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };
    
    // Show onboarding if needed
    if (showOnboarding) {
        return (
            <OnboardingFlow 
                userType={userType} 
                onComplete={completeOnboarding}
            />
        );
    }
    
    return (
        <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-yeild-yellow mb-2">YIELD Dashboard</h1>
                    <div className="space-y-1">
                        <p className="text-xl font-medium text-white">
                            {getGreetingMessage()}, {getUserDisplayName()}! 👋
                        </p>
                        <p className="text-muted-foreground">
                            Ready to earn some rewards today?
                        </p>
                        {referralStats.activeReferrals > 0 && (
                            <p className="text-sm text-green-400">
                                🔥 {referralStats.activeReferrals} active referral{referralStats.activeReferrals !== 1 ? 's' : ''} earning you rewards!
                            </p>
                        )}
                        {dashboardData.userStats && (
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                                <span>Level {dashboardData.userStats.level || 1}</span>
                                <span>•</span>
                                <span>{dashboardData.userStats.points || 0} points</span>
                                <span>•</span>
                                <span>{dashboardData.userStats.tasks_completed || 0} tasks completed</span>
                            </div>
                        )}
                    </div>
                </div>
                <button 
                    onClick={signOut}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded hover:bg-gray-800"
                >
                    Sign Out
                </button>
            </header>

            {/* Bird Status Display - More prominent */}
            <div className="mb-6">
                <BirdStatusDisplay />
            </div>
            
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8">
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="referrals" className="relative">
                        Referrals
                        {referralStats.pendingReferrals > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {referralStats.pendingReferrals}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="chat">Messages</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tasks" className="mt-6">
                    <TasksTab 
                        userStats={dashboardData.userStats} 
                        userTasks={dashboardData.userTasks || []}
                        loadUserData={dashboardData.loadUserData}
                    />
                </TabsContent>
                <TabsContent value="profile" className="mt-6">
                    <ProfileTab />
                </TabsContent>
                <TabsContent value="wallet" className="mt-6">
                    <WalletTab />
                </TabsContent>
                <TabsContent value="referrals" className="mt-6">
                    <ReferralsTab />
                </TabsContent>
                <TabsContent value="chat" className="mt-6">
                    <ChatTab />
                </TabsContent>
                <TabsContent value="community" className="mt-6">
                    <CommunityTab />
                </TabsContent>
                <TabsContent value="leaderboard" className="mt-6">
                    <LeaderboardTab />
                </TabsContent>
                <TabsContent value="support" className="mt-6">
                    <SupportTab />
                </TabsContent>
            </Tabs>
            
            <OnboardingTutorial />
        </div>
    );
};

export default Dashboard;
