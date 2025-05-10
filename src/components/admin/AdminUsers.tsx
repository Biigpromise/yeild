
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  name: string;
  email: string;
  referrals: number;
  streak: number;
  level: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
};

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    referrals: 5,
    streak: 7,
    level: "Silver",
    status: "active",
    joinDate: "2025-02-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    referrals: 2,
    streak: 3,
    level: "Bronze",
    status: "active",
    joinDate: "2025-03-20",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    referrals: 0,
    streak: 0,
    level: "Bronze",
    status: "suspended",
    joinDate: "2025-04-10",
  },
  {
    id: "4",
    name: "Lisa Brown",
    email: "lisa@example.com",
    referrals: 12,
    streak: 15,
    level: "Gold",
    status: "active",
    joinDate: "2025-01-05",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    referrals: 8,
    streak: 10,
    level: "Silver",
    status: "inactive",
    joinDate: "2025-02-25",
  }
];

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSuspendUsers = () => {
    console.log("Suspending users:", selectedUsers);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Search by name or email" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button 
              variant="destructive" 
              disabled={selectedUsers.length === 0}
              onClick={handleSuspendUsers}
            >
              Suspend Selected
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4" 
                      onChange={() => {
                        if (selectedUsers.length === filteredUsers.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        }
                      }}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.referrals}</TableCell>
                    <TableCell>{user.streak}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.level === "Gold" ? "bg-yellow-100 text-yellow-800" :
                        user.level === "Silver" ? "bg-gray-100 text-gray-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {user.level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "active" ? "bg-green-100 text-green-800" :
                        user.status === "inactive" ? "bg-gray-100 text-gray-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={user.status === "suspended" ? "outline" : "destructive"}
                        >
                          {user.status === "suspended" ? "Activate" : "Suspend"}
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
    </div>
  );
};
