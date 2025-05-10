
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type ReferralLevel = {
  id: string;
  name: string;
  requiredReferrals: number;
  rewards: string;
  color: string;
  users: number;
};

const COLORS = ['#FFD100', '#C0C0C0', '#CD7F32', '#50C878', '#9370DB'];

const initialLevels: ReferralLevel[] = [
  { id: "1", name: "Bronze", requiredReferrals: 2, rewards: "2% on referrals", color: "#CD7F32", users: 850 },
  { id: "2", name: "Silver", requiredReferrals: 10, rewards: "5% on referrals", color: "#C0C0C0", users: 420 },
  { id: "3", name: "Gold", requiredReferrals: 50, rewards: "10% on referrals", color: "#FFD100", users: 210 },
  { id: "4", name: "Platinum", requiredReferrals: 100, rewards: "15% on referrals", color: "#50C878", users: 95 },
  { id: "5", name: "Diamond", requiredReferrals: 500, rewards: "20% on referrals", color: "#9370DB", users: 28 },
];

export const AdminReferrals = () => {
  const [levels, setLevels] = useState<ReferralLevel[]>(initialLevels);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ReferralLevel | null>(null);

  const chartData = levels.map(level => ({
    name: level.name,
    value: level.users,
    color: level.color
  }));

  const handleStartEdit = (level: ReferralLevel) => {
    setEditingLevel({...level});
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (editingLevel) {
      setLevels(levels.map(level => 
        level.id === editingLevel.id ? editingLevel : level
      ));
      setIsEditing(false);
      setEditingLevel(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLevel(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Referral Level Distribution</CardTitle>
            <CardDescription>User distribution across referral levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Referral Program Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <h3 className="text-2xl font-bold">12,458</h3>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Active Referrers</p>
                <h3 className="text-2xl font-bold">1,603</h3>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Avg. Referrals/User</p>
                <h3 className="text-2xl font-bold">3.8</h3>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <h3 className="text-2xl font-bold">24.5%</h3>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Top Referrer</p>
              <h3 className="text-xl font-semibold">Jane Smith (145 referrals)</h3>
              <p className="text-sm">Diamond Level · Joined Jan 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Referral Level Configuration</CardTitle>
          {!isEditing && (
            <div>
              <Button variant="outline">Add New Level</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Level Name</label>
                  <Input 
                    value={editingLevel?.name || ''}
                    onChange={(e) => setEditingLevel({...editingLevel!, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Required Referrals</label>
                  <Input 
                    type="number" 
                    value={editingLevel?.requiredReferrals || 0}
                    onChange={(e) => setEditingLevel({
                      ...editingLevel!, 
                      requiredReferrals: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rewards</label>
                  <Input 
                    value={editingLevel?.rewards || ''}
                    onChange={(e) => setEditingLevel({...editingLevel!, rewards: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                    <TableHead>Users</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: level.color }}
                          ></div>
                          <span className="font-medium">{level.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{level.requiredReferrals}</TableCell>
                      <TableCell>{level.rewards}</TableCell>
                      <TableCell>{level.users}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit(level)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
