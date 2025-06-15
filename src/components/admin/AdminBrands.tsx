
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";

type BrandApplication = {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export const AdminBrands = () => {
  const [applications, setApplications] = useState<BrandApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandApplications();
  }, []);

  const fetchBrandApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('brand_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching brand applications:", error);
      toast.error("Failed to load brand applications.");
      setApplications([]);
    } else {
      setApplications(data as BrandApplication[]);
    }
    setLoading(false);
  };
  
  const handleUpdateStatus = async (applicationId: string, userId: string, newStatus: 'approved' | 'rejected') => {
    // First, update the application status
    const { error: statusError } = await supabase
      .from('brand_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (statusError) {
      toast.error(`Failed to ${newStatus} application.`);
      console.error("Error updating status:", statusError);
      return;
    }
    
    // If approved, assign the 'brand' role to the user
    if (newStatus === 'approved') {
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'brand' });

        if (roleError && roleError.code !== '23505') { // 23505 is unique violation, meaning role already exists
            toast.error("Application approved, but failed to assign 'brand' role.");
            console.error("Error assigning role:", roleError);
        } else {
           toast.success("Application approved and 'brand' role assigned.");
        }
    } else {
       toast.success(`Application has been ${newStatus}.`);
    }

    fetchBrandApplications(); // Re-fetch to update the list
  };

  if (loading) {
    return <LoadingState text="Loading brand applications..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="applications">
        <TabsList className="mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Brand Applications</CardTitle>
              <CardDescription>Review and manage new brand partnership requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Application Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="font-medium">{app.company_name}</div>
                          {app.website && (
                            <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
                              {app.website}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                           <Badge variant={
                              app.status === 'approved' ? 'success' : 
                              app.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => handleUpdateStatus(app.id, app.user_id, 'approved')} disabled={app.status !== 'pending'}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, app.user_id, 'rejected')} disabled={app.status !== 'pending'}>Reject</Button>
                            <Button size="sm" variant="outline">Details</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No pending brand applications.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Create and manage brand campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Campaigns Coming Soon</h3>
                <p className="text-muted-foreground">Campaign management features are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Brand Performance</CardTitle>
              <CardDescription>Track and analyze brand campaign performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Brand performance analytics are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
