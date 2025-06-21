
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  MessageSquare, 
  Settings, 
  Download,
  Bell,
  Users,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminQuickActions = () => {
  const navigate = useNavigate();

  const handleNavigateToNotifications = () => {
    // Navigate to admin page with notifications focus
    navigate('/admin');
    // Use setTimeout to ensure the page loads before trying to focus elements
    setTimeout(() => {
      const notificationsTab = document.querySelector('[data-tab="notifications"]');
      if (notificationsTab) {
        (notificationsTab as HTMLElement).click();
      }
    }, 100);
  };

  const handleNavigateToUsers = () => {
    // Navigate to admin page with users focus
    navigate('/admin');
    setTimeout(() => {
      const usersTab = document.querySelector('[data-tab="users"]');
      if (usersTab) {
        (usersTab as HTMLElement).click();
      }
    }, 100);
  };

  const handleNavigateToTasks = () => {
    // Navigate to admin page with tasks focus
    navigate('/admin');
    setTimeout(() => {
      const tasksTab = document.querySelector('[data-tab="enhanced-tasks"]');
      if (tasksTab) {
        (tasksTab as HTMLElement).click();
      }
    }, 100);
  };

  const handleNavigateToSecurity = () => {
    // Navigate to admin page with security focus
    navigate('/admin');
    setTimeout(() => {
      const securityTab = document.querySelector('[data-tab="security"]');
      if (securityTab) {
        (securityTab as HTMLElement).click();
      }
    }, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2 hover:bg-blue-50"
            onClick={handleNavigateToUsers}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Manage Users</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2 hover:bg-green-50"
            onClick={handleNavigateToNotifications}
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">Send Notifications</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2 hover:bg-purple-50"
            onClick={handleNavigateToTasks}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Manage Tasks</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2 hover:bg-red-50"
            onClick={handleNavigateToSecurity}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm">Security</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
