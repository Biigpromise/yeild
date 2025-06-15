
import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { realAdminUserService } from "@/services/admin/realAdminUserService";
import { TaskCreationForm } from "@/components/admin/enhanced/TaskCreationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlatformConfigManager } from "@/components/admin/content/PlatformConfigManager";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";

export const AdminQuickActions = () => {
  const navigate = useNavigate();

  // State for each dialog/modal
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [importUsersOpen, setImportUsersOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [platformSettingsOpen, setPlatformSettingsOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [refreshingCache, setRefreshingCache] = useState(false);

  // Dummy states (for demonstration)
  const [exportingData, setExportingData] = useState(false);

  // Dialog: Add New User
  const handleAddUser = () => setAddUserOpen(true);

  // Dialog: Create Task
  const handleCreateTask = () => setCreateTaskOpen(true);

  // Dialog: Send Announcement
  const handleSendAnnouncement = () => setAnnouncementOpen(true);

  // Export Data: call service
  const handleExportData = async () => {
    setExportingData(true);
    try {
      await realAdminUserService.exportUserData('json');
      // Download triggered by service already
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data"
      });
    }
    setExportingData(false);
  };

  // Dialog: Import Users
  const handleImportUsers = () => setImportUsersOpen(true);

  // System Maintenance: open settings modal scroll to Maintenance
  const handleSystemMaintenance = () => setMaintenanceOpen(true);

  // Platform Settings: open dialog, or navigate to settings page
  const handlePlatformSettings = () => {
    navigate("/admin/settings");
    // If you prefer dialog:
    // setPlatformSettingsOpen(true);
  };

  // Refresh Cache: (would normally call a backend function, here just show a toast)
  const handleRefreshCache = async () => {
    setRefreshingCache(true);
    // If you have a real backend function, call it here
    setTimeout(() => {
      setRefreshingCache(false);
      toast({
        title: "Cache refreshed!",
        description: "System cache has been cleared.",
      });
    }, 1000);
  };

  const quickActions = [
    {
      title: "Add New User",
      description: "Manually create a new user account",
      icon: <UserPlus className="h-5 w-5" />,
      action: handleAddUser,
      variant: "default" as const
    },
    {
      title: "Create Task",
      description: "Create a new task for users",
      icon: <ClipboardPlus className="h-5 w-5" />,
      action: handleCreateTask,
      variant: "default" as const
    },
    {
      title: "Send Announcement",
      description: "Broadcast message to all users",
      icon: <Megaphone className="h-5 w-5" />,
      action: handleSendAnnouncement,
      variant: "default" as const
    },
    {
      title: "Export Data",
      description: "Download user and task reports",
      icon: <Download className="h-5 w-5" />,
      action: handleExportData,
      variant: "outline" as const,
      loading: exportingData,
    },
    {
      title: "Import Users",
      description: "Bulk import users from CSV",
      icon: <Upload className="h-5 w-5" />,
      action: handleImportUsers,
      variant: "outline" as const
    },
    {
      title: "Refresh Cache",
      description: "Clear system cache",
      icon: <RefreshCw className="h-5 w-5" />,
      action: handleRefreshCache,
      variant: "outline" as const,
      loading: refreshingCache,
    },
    {
      title: "System Maintenance",
      description: "Enable maintenance mode",
      icon: <AlertCircle className="h-5 w-5" />,
      action: handleSystemMaintenance,
      variant: "destructive" as const
    },
    {
      title: "Platform Settings",
      description: "Configure platform settings",
      icon: <Settings className="h-5 w-5" />,
      action: handlePlatformSettings,
      variant: "outline" as const
    }
  ];

  return (
    <>
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
                  disabled={action.loading || false}
                >
                  {(action.loading) ? "Processing..." : "Execute"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Add New User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          {/* Add New User form will be implemented here or can reuse AdminUserActions dialog */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Add New User</h3>
            <p className="mb-2 text-sm text-muted-foreground">Manually create a new user account</p>
            {/* Import your real add-user form here or a placeholder */}
            <p>Invoke "Add User" dialog from your User Management tab here.</p>
          </div>
        </DialogContent>
      </Dialog>
      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogContent className="overflow-y-auto max-h-[90vh]">
          <TaskCreationForm
            onTaskCreated={() => setCreateTaskOpen(false)}
            onCancel={() => setCreateTaskOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Send Announcement */}
      <AnnouncementDialog open={announcementOpen} onOpenChange={setAnnouncementOpen} />
      {/* Import Users Dialog */}
      <Dialog open={importUsersOpen} onOpenChange={setImportUsersOpen}>
        <DialogContent>
          <div>
            <h3 className="text-lg font-semibold mb-2">Import Users</h3>
            <p className="mb-2 text-sm text-muted-foreground">Bulk import users from a CSV file</p>
            {/* Import your real import users form here or a placeholder */}
            <p>Invoke "Import Users" dialog from your User Management tab here.</p>
          </div>
        </DialogContent>
      </Dialog>
      {/* System Maintenance */}
      <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <DialogContent>
          <PlatformConfigManager />
        </DialogContent>
      </Dialog>
      {/* If you want a modal for Platform Settings, you can add it here */}
      {/* <Dialog open={platformSettingsOpen} onOpenChange={setPlatformSettingsOpen}>
        <DialogContent>
          <PlatformConfigManager />
        </DialogContent>
      </Dialog> */}
    </>
  );
};
