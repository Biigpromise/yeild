
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rewardsService, Reward, Achievement, RewardRedemption } from "@/services/rewardsService";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Package, Trophy, Users } from "lucide-react";

export const AdminRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsData, achievementsData, redemptionsData] = await Promise.all([
        rewardsService.admin.getAllRewards(),
        rewardsService.admin.getAllAchievements(),
        rewardsService.admin.getAllRedemptions()
      ]);
      
      setRewards(rewardsData);
      setAchievements(achievementsData);
      setRedemptions(redemptionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRedemptionStatus = async (id: string, status: RewardRedemption['status']) => {
    try {
      await rewardsService.admin.updateRedemptionStatus(id, status);
      toast.success(`Redemption ${status} successfully`);
      loadData();
    } catch (error) {
      console.error("Error updating redemption:", error);
      toast.error("Failed to update redemption");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRewards = rewards.filter(reward =>
    reward.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const totalRedemptions = redemptions.length;
  const totalRewards = rewards.length;
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">{totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Achievements</p>
                <p className="text-2xl font-bold">{totalAchievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Redemptions</p>
                <p className="text-2xl font-bold">{pendingRedemptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Redemptions</p>
                <p className="text-2xl font-bold">{totalRedemptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="redemptions">
            Redemptions
            {pendingRedemptions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRedemptions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rewards Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points Required</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reward.reward_type}</Badge>
                        </TableCell>
                        <TableCell>{reward.points_required} pts</TableCell>
                        <TableCell>
                          {reward.stock_quantity === null ? 'Unlimited' : reward.stock_quantity}
                        </TableCell>
                        <TableCell>
                          <Badge className={reward.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {reward.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Achievements Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Points Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAchievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell className="font-medium">{achievement.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{achievement.achievement_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {achievement.requirement_value} {achievement.requirement_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{achievement.points_reward} pts</TableCell>
                        <TableCell>
                          <Badge className={achievement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {achievement.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="redemptions">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Points Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Redeemed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>{(redemption as any).profiles?.name || 'Unknown User'}</TableCell>
                        <TableCell className="font-medium">{redemption.rewards.title}</TableCell>
                        <TableCell>{redemption.points_spent} pts</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(redemption.status)}>
                            {redemption.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(redemption.redeemed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {redemption.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateRedemptionStatus(redemption.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleUpdateRedemptionStatus(redemption.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          {redemption.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateRedemptionStatus(redemption.id, 'delivered')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
