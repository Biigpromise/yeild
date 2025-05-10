
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAnnouncements } from "@/components/admin/AdminAnnouncements";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { Bell, Settings, Users } from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-yeild-yellow mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[400px] mb-8">
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Create and manage announcements for your users.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAnnouncements />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUsers />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your platform settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
