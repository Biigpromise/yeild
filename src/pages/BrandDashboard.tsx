import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EmailConfirmationRequired } from "@/components/auth/EmailConfirmationRequired";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart } from 'lucide-react';

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(true);
  const [brandStats, setBrandStats] = useState({ campaigns: 0, tasks: 0, submissions: 0 });

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!user) {
        setCheckingEmailStatus(false);
        return;
      }

      const { data: authUser, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error checking user:', error);
        setEmailConfirmed(false);
      } else if (authUser.user?.email_confirmed_at) {
        setEmailConfirmed(true);
      } else {
        setEmailConfirmed(false);
      }
      
      setCheckingEmailStatus(false);
    };

    if (!loading) {
      checkEmailConfirmation();
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchBrandStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('brands')
          .select('campaigns, tasks, submissions')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching brand stats:', error);
        } else {
          setBrandStats(data || { campaigns: 0, tasks: 0, submissions: 0 });
        }
      } catch (error) {
        console.error('Unexpected error fetching brand stats:', error);
      }
    };

    fetchBrandStats();
  }, [user]);

  if (loading || checkingEmailStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (emailConfirmed === false) {
    return <EmailConfirmationRequired email={user.email || ''} userType="brand" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user.user_metadata?.company_name || 'Brand User'}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaigns
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandStats.campaigns}</div>
              <p className="text-sm text-muted-foreground">
                Active and past campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tasks
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandStats.tasks}</div>
              <p className="text-sm text-muted-foreground">
                Tasks created for campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandStats.submissions}</div>
              <p className="text-sm text-muted-foreground">
                Submissions received from users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button onClick={() => navigate('/campaigns/new')}>Create New Campaign</Button>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
