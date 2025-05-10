
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Brand = {
  id: string;
  name: string;
  logo: string;
  campaigns: number;
  activeTasks: number;
  status: "active" | "inactive" | "pending";
  joinDate: string;
};

const mockBrands: Brand[] = [
  {
    id: "1",
    name: "TechCorp",
    logo: "TC",
    campaigns: 3,
    activeTasks: 5,
    status: "active",
    joinDate: "2025-01-15",
  },
  {
    id: "2",
    name: "FitLife",
    logo: "FL",
    campaigns: 2,
    activeTasks: 3,
    status: "active",
    joinDate: "2025-02-20",
  },
  {
    id: "3",
    name: "EcoFriendly",
    logo: "EF",
    campaigns: 1,
    activeTasks: 0,
    status: "inactive",
    joinDate: "2025-03-10",
  },
  {
    id: "4",
    name: "MusicBox",
    logo: "MB",
    campaigns: 0,
    activeTasks: 0,
    status: "pending",
    joinDate: "2025-05-05",
  },
];

export const AdminBrands = () => {
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  
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
                    {brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                              {brand.logo}
                            </div>
                            <span className="font-medium">{brand.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{brand.campaigns}</TableCell>
                        <TableCell>{brand.activeTasks}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            brand.status === "active" ? "bg-green-100 text-green-800" :
                            brand.status === "inactive" ? "bg-gray-100 text-gray-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {brand.status}
                          </span>
                        </TableCell>
                        <TableCell>{brand.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
