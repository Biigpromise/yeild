
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { AdminBrands } from "@/components/admin/AdminBrands";

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-yeild-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yeild-yellow" />
            <div>
              <h1 className="text-3xl font-bold text-yeild-yellow">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.email}</p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </header>

        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brands">Brand Applications</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="brands" className="mt-6">
            <AdminBrands />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-gray-400">User management tools coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-gray-400">Task management tools coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Platform Analytics</h3>
              <p className="text-gray-400">Analytics dashboard coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
