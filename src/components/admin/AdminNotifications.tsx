
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Notification = {
  id: string;
  title: string;
  content: string;
  sentTo: string;
  sentAt: string;
  status: "scheduled" | "sent" | "draft";
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Task Available",
    content: "Check out our latest task with a 50-point reward!",
    sentTo: "All Users",
    sentAt: "2025-05-05 09:30",
    status: "sent",
  },
  {
    id: "2",
    title: "App Update Required",
    content: "Please update your app to the latest version for new features.",
    sentTo: "iOS Users",
    sentAt: "2025-05-06 14:15",
    status: "sent",
  },
  {
    id: "3",
    title: "Weekend Challenge",
    content: "Participate in our weekend challenge to earn bonus points!",
    sentTo: "Active Users",
    sentAt: "2025-05-08 18:00",
    status: "scheduled",
  },
];

export const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("broadcast");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    target: "all",
  });
  
  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.content) {
      alert("Please fill in all fields");
      return;
    }
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      content: newNotification.content,
      sentTo: newNotification.target === "all" ? "All Users" : 
              newNotification.target === "active" ? "Active Users" : 
              "Targeted Users",
      sentAt: new Date().toLocaleString(),
      status: "sent",
    };
    
    setNotifications([notification, ...notifications]);
    setNewNotification({
      title: "",
      content: "",
      target: "all",
    });
    
    alert("Notification sent successfully!");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Send New Notification</CardTitle>
              <CardDescription>Broadcast a message to your users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Notification Title</label>
                <Input 
                  placeholder="Enter notification title" 
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message Content</label>
                <Textarea 
                  placeholder="Enter your message" 
                  rows={5}
                  value={newNotification.content}
                  onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select 
                  className="w-full h-10 border border-input rounded-md px-3"
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users (logged in last 7 days)</option>
                  <option value="inactive">Inactive Users (no login for 14+ days)</option>
                  <option value="newUsers">New Users (joined in last 30 days)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Option</label>
                  <select className="w-full h-10 border border-input rounded-md px-3">
                    <option value="now">Send Immediately</option>
                    <option value="schedule">Schedule for Later</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Type</label>
                  <select className="w-full h-10 border border-input rounded-md px-3">
                    <option value="app">In-App</option>
                    <option value="push">Push Notification</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendNotification}>Send Notification</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View all previous notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.content}</TableCell>
                        <TableCell>{notification.sentTo}</TableCell>
                        <TableCell>{notification.sentAt}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.status === "sent" ? "bg-green-100 text-green-800" :
                            notification.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {notification.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            {notification.status === "scheduled" ? "Cancel" : "Resend"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Manage reusable notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Templates Coming Soon</h3>
                <p className="text-muted-foreground">Notification templates feature is under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
