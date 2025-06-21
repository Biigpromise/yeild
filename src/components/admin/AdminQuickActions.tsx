
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
    console.log('Navigating to notifications...');
    navigate('/admin');
    // Use setTimeout to ensure the page loads before trying to focus elements
    setTimeout(() => {
      // Try to click the notifications tab
      const notificationsButton = document.querySelector('[value="notifications"]') as HTMLButtonElement;
      if (notificationsButton) {
        notificationsButton.click();
      } else {
        console.log('Notifications tab not found');
      }
    }, 500);
  };

  const handleNavigateToUsers = () => {
    console.log('Navigating to users...');
    navigate('/admin');
    setTimeout(() => {
      // Try to click the users tab
      const usersButton = document.querySelector('[value="users"]') as HTMLButtonElement;
      if (usersButton) {
        usersButton.click();
      } else {
        console.log('Users tab not found');
      }
    }, 500);
  };

  const handleNavigateToTasks = () => {
    console.log('Navigating to tasks...');
    navigate('/admin');
    setTimeout(() => {
      // Try to click the enhanced-tasks tab
      const tasksButton = document.querySelector('[value="enhanced-tasks"]') as HTMLButtonElement;
      if (tasksButton) {
        tasksButton.click();
      } else {
        console.log('Enhanced tasks tab not found');
      }
    }, 500);
  };

  const handleNavigateToSecurity = () => {
    console.log('Navigating to security...');
    navigate('/admin');
    setTimeout(() => {
      // Try to click the security tab
      const securityButton = document.querySelector('[value="security"]') as HTMLButtonElement;
      if (securityButton) {
        securityButton.click();
      } else {
        console.log('Security tab not found');
      }
    }, 500);
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
