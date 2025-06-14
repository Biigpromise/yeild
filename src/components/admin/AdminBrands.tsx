
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";

export const AdminBrands = () => {
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch brands from Supabase
    // For now, we'll show an empty state
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingState text="Loading brands..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="brands">
        <TabsList className="mb-6">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Brand Management</CardTitle>
              <Button onClick={() => setIsAddingBrand(!isAddingBrand)}>
                {isAddingBrand ? "Cancel" : "Add Brand"}
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingBrand && (
                <Card className="mb-6 border border-border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Brand Name</label>
                        <Input placeholder="Enter brand name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Email</label>
                        <Input type="email" placeholder="Enter contact email" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Brand Description</label>
                      <Textarea placeholder="Enter brand description" rows={3} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Logo</label>
                      <Input type="file" className="pt-1" />
                    </div>
                    <div className="flex justify-end">
                      <Button>Add Brand</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead>Active Tasks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No brands found. Brand management system needs to be implemented.
                      </TableCell>
                    </TableRow>
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
