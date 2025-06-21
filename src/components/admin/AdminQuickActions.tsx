
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
    // Navigate to notifications tab in admin
    navigate('/admin?tab=notifications');
  };

  const handleNavigateToUsers = () => {
    // Navigate to users tab in admin  
    navigate('/admin?tab=users');
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
            className="h-20 flex-col gap-2"
            onClick={handleNavigateToUsers}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Manage Users</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={handleNavigateToNotifications}
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">Send Notifications</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/admin?tab=tasks')}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Manage Tasks</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/admin?tab=security')}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm">Security</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
