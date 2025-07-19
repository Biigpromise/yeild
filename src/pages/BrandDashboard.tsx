
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandCampaignsTab } from "@/components/brand/BrandCampaignsTab";
import { BrandAnalyticsTab } from "@/components/brand/BrandAnalyticsTab";
import { BrandProfileTab } from "@/components/brand/BrandProfileTab";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LifeBuoy, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { showOnboarding, userType, completeOnboarding } = useOnboarding();
    
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
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-yeild-yellow">Brand Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {user?.user_metadata.company_name || 'Brand Partner'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/support')} variant="outline" size="sm">
                        <LifeBuoy className="mr-2 h-4 w-4" /> Support
                    </Button>
                    <Button onClick={signOut} variant="outline" size="sm">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </header>
            
            <Tabs defaultValue="campaigns" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="profile">Profile & Billing</TabsTrigger>
                </TabsList>
                <TabsContent value="campaigns" className="mt-6">
                    <BrandCampaignsTab />
                </TabsContent>
                <TabsContent value="analytics" className="mt-6">
                    <BrandAnalyticsTab />
                </TabsContent>
                <TabsContent value="profile" className="mt-6">
                    <BrandProfileTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default BrandDashboard;
