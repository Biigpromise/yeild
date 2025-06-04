
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  ClipboardPlus, 
  Megaphone, 
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AdminQuickActions = () => {
  const handleQuickAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated`,
    });
  };

  const quickActions = [
    {
      title: "Add New User",
      description: "Manually create a new user account",
      icon: <UserPlus className="h-5 w-5" />,
      action: () => handleQuickAction("Add New User"),
      variant: "default" as const
    },
    {
      title: "Create Task",
      description: "Create a new task for users",
      icon: <ClipboardPlus className="h-5 w-5" />,
      action: () => handleQuickAction("Create Task"),
      variant: "default" as const
    },
    {
      title: "Send Announcement",
      description: "Broadcast message to all users",
      icon: <Megaphone className="h-5 w-5" />,
      action: () => handleQuickAction("Send Announcement"),
      variant: "default" as const
    },
    {
      title: "Export Data",
      description: "Download user and task reports",
      icon: <Download className="h-5 w-5" />,
      action: () => handleQuickAction("Export Data"),
      variant: "outline" as const
    },
    {
      title: "Import Users",
      description: "Bulk import users from CSV",
      icon: <Upload className="h-5 w-5" />,
      action: () => handleQuickAction("Import Users"),
      variant: "outline" as const
    },
    {
      title: "Refresh Cache",
      description: "Clear system cache",
      icon: <RefreshCw className="h-5 w-5" />,
      action: () => handleQuickAction("Refresh Cache"),
      variant: "outline" as const
    },
    {
      title: "System Maintenance",
      description: "Enable maintenance mode",
      icon: <AlertCircle className="h-5 w-5" />,
      action: () => handleQuickAction("System Maintenance"),
      variant: "destructive" as const
    },
    {
      title: "Platform Settings",
      description: "Configure platform settings",
      icon: <Settings className="h-5 w-5" />,
      action: () => handleQuickAction("Platform Settings"),
      variant: "outline" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                {action.icon}
                <h4 className="font-medium text-sm">{action.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
              <Button 
                size="sm" 
                variant={action.variant}
                onClick={action.action}
                className="w-full"
              >
                Execute
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
