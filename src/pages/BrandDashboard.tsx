
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandCampaignsTab } from "@/components/brand/BrandCampaignsTab";
import { BrandAnalyticsTab } from "@/components/brand/BrandAnalyticsTab";
import { BrandProfileTab } from "@/components/brand/BrandProfileTab";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { LifeBuoy, LogOut, Mail, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BrandDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { showOnboarding, userType, completeOnboarding } = useOnboarding();
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    // Check email verification status
    useEffect(() => {
        if (user) {
            setIsEmailVerified(!!user.email_confirmed_at);
        }
    }, [user]);

    const handleResendVerification = async () => {
        if (!user?.email) return;
        
        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
                options: {
                    emailRedirectTo: `${window.location.origin}/brand-dashboard`
                }
            });
            
            if (error) {
                toast.error("Failed to resend verification email");
            } else {
                toast.success("Verification email sent! Please check your inbox.");
            }
        } catch (error) {
            toast.error("An error occurred while sending the email");
        } finally {
            setIsResending(false);
        }
    };
    
    // Show email verification required screen
    if (!isEmailVerified) {
        return (
            <div className="min-h-screen bg-yeild-black text-white flex items-center justify-center">
                <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-800">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-yeild-yellow" />
                        </div>
                        <CardTitle className="text-yeild-yellow">Email Verification Required</CardTitle>
                        <CardDescription className="text-gray-400">
                            Please verify your email address to access the Brand Dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-gray-400">
                            <p>We sent a verification link to:</p>
                            <p className="font-semibold text-white mt-1">{user?.email}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <Button 
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90"
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </Button>
                            
                            <Button 
                                onClick={signOut}
                                variant="outline" 
                                className="w-full"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                            <p>Check your spam folder if you don't see the email.</p>
                            <p>After verifying, refresh this page to continue.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
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
