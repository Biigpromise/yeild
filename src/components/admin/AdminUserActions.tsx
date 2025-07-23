import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { realAdminUserService } from "@/services/admin/realAdminUserService";
import { UserPlus, Users, Download, Upload } from "lucide-react";
import { toast } from "sonner";

export const AdminUserActions = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "" });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const success = await realAdminUserService.createUser(newUser);
      if (success) {
        setNewUser({ email: "", name: "", password: "" });
        setIsAddUserOpen(false);
        toast.success("User created successfully");
      } else {
        setError("Failed to create user. Email may already be registered or your connection failed.");
      }
    } catch (e: any) {
      setError(e?.message || "Unknown error occurred");
      toast.error("Failed to create user: " + (e?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await realAdminUserService.exportUserData('json');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await realAdminUserService.importUsers(importFile);
      if (success) {
        setImportFile(null);
        setIsImportOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsAddUserOpen(open);
    if (!open) setError(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Add New User */}
      <Dialog open={isAddUserOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5" />
                <h4 className="font-medium text-sm">Add New User</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Manually create a new user account</p>
              <Button size="sm" className="w-full">Execute</Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="User Name"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password (min 6 characters)"
                minLength={6}
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button 
              onClick={handleAddUser} 
              className="w-full"
              disabled={isLoading || !newUser.email || !newUser.name || !newUser.password}
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportData}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5" />
            <h4 className="font-medium text-sm">Export Data</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Download user and platform data</p>
          <Button size="sm" variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? "Exporting..." : "Execute"}
          </Button>
        </CardContent>
      </Card>

      {/* Import Users */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5" />
                <h4 className="font-medium text-sm">Import Users</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Bulk import users from CSV</p>
              <Button size="sm" variant="outline" className="w-full">Execute</Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Users from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csvFile">CSV File *</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                CSV should have columns: email, name, password (optional)
              </p>
            </div>
            <Button 
              onClick={handleImportUsers} 
              className="w-full"
              disabled={isLoading || !importFile}
            >
              {isLoading ? "Importing..." : "Import Users"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View All Users */}
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          // Dispatch custom event to navigate to users section
          window.dispatchEvent(new CustomEvent('navigateToUsers'));
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" />
            <h4 className="font-medium text-sm">View All Users</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Manage all user accounts</p>
          <Button size="sm" variant="outline" className="w-full">View Users</Button>
        </CardContent>
      </Card>
    </div>
  );
};
