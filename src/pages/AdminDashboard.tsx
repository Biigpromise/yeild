
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { TaskManagement } from '@/components/admin/TaskManagement';
import { AdminFinancialManagement } from '@/components/admin/AdminFinancialManagement';
import { AdminWallet } from '@/components/admin/AdminWallet';
import { BrandApplicationsManager } from '@/components/admin/BrandApplicationsManager';
import { CampaignApprovalManager } from '@/components/admin/CampaignApprovalManager';
import { TaskSubmissionReviewManager } from '@/components/admin/TaskSubmissionReviewManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingState } from '@/components/ui/loading-state';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    // Listen for navigation events
    const handleNavigateToSubmissions = () => setActiveTab('submissions');
    const handleNavigateToCreateTask = () => setActiveTab('tasks');
    const handleNavigateToUsers = () => setActiveTab('overview');

    window.addEventListener('navigateToSubmissions', handleNavigateToSubmissions);
    window.addEventListener('navigateToCreateTask', handleNavigateToCreateTask);
    window.addEventListener('navigateToUsers', handleNavigateToUsers);

    return () => {
      window.removeEventListener('navigateToSubmissions', handleNavigateToSubmissions);
      window.removeEventListener('navigateToCreateTask', handleNavigateToCreateTask);
      window.removeEventListener('navigateToUsers', handleNavigateToUsers);
    };
  }, []);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      
      // Check admin role using the admin-operations function
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'check_admin_access',
          user_id: user.id 
        }
      });

      if (error) {
        console.error('Error checking admin access:', error);
        toast.error('Error checking admin access');
        setIsAdmin(false);
        navigate('/dashboard');
        return;
      }

      if (data?.has_admin_access) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
      toast.error('Error checking admin access');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState text="Checking admin access..." />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              You don't have admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your platform operations</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="brands" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Brands
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Finances
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="brands" className="mt-6">
            <BrandApplicationsManager />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignApprovalManager />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <TaskSubmissionReviewManager />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="finances" className="mt-6">
            <AdminFinancialManagement />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <AdminWallet />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
