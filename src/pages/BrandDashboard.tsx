
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandCampaignsTab } from "@/components/brand/BrandCampaignsTab";
import { BrandAnalyticsTab } from "@/components/brand/BrandAnalyticsTab";
import { BrandProfileTab } from "@/components/brand/BrandProfileTab";
import { BrandBillingTab } from "@/components/brand/BrandBillingTab";
import { BrandPerformanceTab } from "@/components/brand/BrandPerformanceTab";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { EmailConfirmationGuard } from "@/components/brand/EmailConfirmationGuard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LifeBuoy, LogOut, Building, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { showOnboarding, userType, completeOnboarding } = useOnboarding();
    
    const getBrandDisplayName = () => {
        if (user?.user_metadata?.company_name?.trim()) {
            return user.user_metadata.company_name.trim();
        }
        if (user?.user_metadata?.name?.trim()) {
            return user.user_metadata.name.trim();
        }
        if (user?.email) {
            const emailName = user.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1) + ' Company';
        }
        return 'Brand Partner';
    };

    const getGreetingMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };
    
    if (showOnboarding) {
        return (
            <OnboardingFlow 
                userType={userType} 
                onComplete={completeOnboarding}
            />
        );
    }
    
    return (
        <EmailConfirmationGuard>
            <div className="min-h-screen bg-white">
                <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Building className="w-8 h-8 text-black" />
                                <h1 className="text-3xl font-bold text-black">Brand Dashboard</h1>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-medium text-gray-900">
                                    {getGreetingMessage()}, {getBrandDisplayName()}! 🚀
                                </p>
                                <p className="text-gray-600">
                                    Create campaigns, manage tasks, and track your marketing performance
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span>Brand Account Active</span>
                                    {user?.email_confirmed_at && (
                                        <>
                                            <span>•</span>
                                            <span className="text-green-600">Email Verified</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                onClick={() => navigate('/campaigns/create')} 
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                <Plus className="mr-2 h-4 w-4" /> 
                                Create Campaign
                            </Button>
                            <Button onClick={() => navigate('/support')} variant="outline" size="sm">
                                <LifeBuoy className="mr-2 h-4 w-4" /> Support
                            </Button>
                            <Button onClick={signOut} variant="outline" size="sm">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </header>
                    
                    <Tabs defaultValue="campaigns" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
                            <TabsTrigger value="campaigns" className="data-[state=active]:bg-white data-[state=active]:text-black">Campaigns</TabsTrigger>
                            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-black">Performance</TabsTrigger>
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-black">Analytics</TabsTrigger>
                            <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:text-black">Billing</TabsTrigger>
                            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-black">Profile</TabsTrigger>
                        </TabsList>
                        <TabsContent value="campaigns" className="mt-6">
                            <BrandCampaignsTab />
                        </TabsContent>
                        <TabsContent value="performance" className="mt-6">
                            <BrandPerformanceTab />
                        </TabsContent>
                        <TabsContent value="analytics" className="mt-6">
                            <BrandAnalyticsTab />
                        </TabsContent>
                        <TabsContent value="billing" className="mt-6">
                            <BrandBillingTab />
                        </TabsContent>
                        <TabsContent value="profile" className="mt-6">
                            <BrandProfileTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </EmailConfirmationGuard>
    );
}

export default BrandDashboard;
