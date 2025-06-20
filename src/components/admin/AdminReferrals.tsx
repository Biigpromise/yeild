
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminReferralService, ReferralLevel } from "@/services/admin/adminReferralService";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminBirdLevelOverrides } from "./AdminBirdLevelOverrides";
import { AntiFraudTracking } from "./AntiFraudTracking";

export const AdminReferrals = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ReferralLevel | null>(null);

  const { data: levels, isLoading } = useQuery<ReferralLevel[]>({
    queryKey: ['referralLevels'],
    queryFn: adminReferralService.getReferralLevels
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<ReferralLevel> }) => 
      adminReferralService.updateReferralLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralLevels'] });
      setIsEditing(false);
      setEditingLevel(null);
    },
  });

  const handleStartEdit = (level: ReferralLevel) => {
    setEditingLevel({...level});
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (editingLevel) {
      const { id, created_at, updated_at, ...updateData } = editingLevel;
      updateMutation.mutate({ id, data: updateData });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLevel(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="levels">Bird Levels</TabsTrigger>
          <TabsTrigger value="overrides">Manual Overrides</TabsTrigger>
          <TabsTrigger value="fraud">Anti-Fraud</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Level Distribution</CardTitle>
                <CardDescription>User distribution across referral levels</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-center">Referral tracking data is not yet available.<br/>This requires additional database setup.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Referral Program Stats</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-center">Referral statistics are not yet available.<br/>This requires additional database setup.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Referral Level Configuration</CardTitle>
              {!isEditing && (
                <div>
                  <Button variant="outline" disabled>Add New Level</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditing && editingLevel ? (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Editing: {editingLevel.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Level Name</label>
                      <Input 
                        value={editingLevel.name || ''}
                        onChange={(e) => setEditingLevel({...editingLevel, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Required Referrals</label>
                      <Input 
                        type="number" 
                        value={editingLevel.required_referrals || 0}
                        onChange={(e) => setEditingLevel({
                          ...editingLevel, 
                          required_referrals: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rewards Description</label>
                      <Input 
                        value={editingLevel.rewards_description || ''}
                        onChange={(e) => setEditingLevel({...editingLevel, rewards_description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Required Referrals</TableHead>
                        <TableHead>Rewards</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={4}>
                              <Skeleton className="h-8 w-full" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        levels?.map((level) => (
                          <TableRow key={level.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: level.color || '#ccc' }}
                                ></div>
                                <span className="font-medium">{level.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{level.required_referrals}</TableCell>
                            <TableCell>{level.rewards_description}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleStartEdit(level)}>
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides">
          <AdminBirdLevelOverrides />
        </TabsContent>

        <TabsContent value="fraud">
          <AntiFraudTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};
