
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Users, Download, Upload } from "lucide-react";

export const AdminUserActions = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "" });
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.name || !newUser.password) {
        toast.error("Please fill in all fields");
        return;
      }

      // Create user account
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          name: newUser.name
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error("Failed to create user: " + error.message);
        return;
      }

      // Create profile
      if (data.user) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: newUser.email,
            name: newUser.name
          });
      }

      toast.success("User created successfully!");
      setNewUser({ email: "", name: "", password: "" });
      setIsAddUserOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user");
    }
  };

  const handleExportData = async () => {
    try {
      // Get users data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      // Get tasks data
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      // Get submissions data
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*');

      if (submissionsError) throw submissionsError;

      // Create export data
      const exportData = {
        users: users || [],
        tasks: tasks || [],
        submissions: submissions || [],
        exportDate: new Date().toISOString()
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yeild-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("Failed to export data");
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {};
        headers.forEach((header, index) => {
          user[header] = values[index];
        });
        return user;
      }).filter(user => user.email && user.name);

      let successCount = 0;
      for (const user of users) {
        try {
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password || 'TempPassword123!',
            user_metadata: {
              name: user.name
            }
          });

          if (!error && data.user) {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: user.email,
                name: user.name
              });
            successCount++;
          }
        } catch (userError) {
          console.error('Error creating user:', user.email, userError);
        }
      }

      toast.success(`Imported ${successCount} users successfully!`);
      setImportFile(null);
      setIsImportOpen(false);
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error("Failed to import users");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Add New User */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="User Name"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password"
              />
            </div>
            <Button onClick={handleAddUser} className="w-full">
              Create User
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
          <p className="text-xs text-muted-foreground mb-3">Download user and task reports</p>
          <Button size="sm" variant="outline" className="w-full">Execute</Button>
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
              <Label htmlFor="csvFile">CSV File</Label>
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
            <Button onClick={handleImportUsers} className="w-full">
              Import Users
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View All Users - Link to Users tab */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
