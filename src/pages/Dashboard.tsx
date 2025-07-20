
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

const Dashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const { showOnboarding, userType, completeOnboarding } = useOnboarding();
    const dashboardData = useDashboard();
    
    // Mock user stats for experience level calculation
    const { isFeatureUnlocked } = useExperienceLevel(0, 0, 0);
    
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
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-yeild-yellow">YIELD Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Welcome back, {user?.user_metadata.full_name || 'YEILDer'}!</p>
                    </div>
                </div>
                <button 
                    onClick={signOut}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Sign Out
                </button>
            </header>

            {/* Bird Status Display - Prominent placement */}
            <div className="mb-8">
                <BirdStatusDisplay />
            </div>
            
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8">
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="referrals">Referrals</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tasks" className="mt-6">
                    <TasksTab 
                        userStats={dashboardData.userStats} 
                        userTasks={dashboardData.userTasks}
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
