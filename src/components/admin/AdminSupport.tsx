
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  status: "open" | "closed" | "in-progress";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
};

const mockTickets: Ticket[] = [
  {
    id: "TCK-001",
    subject: "Cannot complete task submission",
    user: "john_doe",
    status: "open",
    priority: "high",
    createdAt: "2025-05-04 15:32",
    lastUpdated: "2025-05-04 15:32",
  },
  {
    id: "TCK-002",
    subject: "Points not awarded for completed task",
    user: "emma_wilson",
    status: "in-progress",
    priority: "medium",
    createdAt: "2025-05-03 09:14",
    lastUpdated: "2025-05-04 12:45",
  },
  {
    id: "TCK-003",
    subject: "Account login issues",
    user: "robert_smith",
    status: "closed",
    priority: "low",
    createdAt: "2025-05-02 17:23",
    lastUpdated: "2025-05-03 11:05",
  },
  {
    id: "TCK-004",
    subject: "Referral link not working",
    user: "lisa_jones",
    status: "open",
    priority: "medium",
    createdAt: "2025-05-04 13:10",
    lastUpdated: "2025-05-04 13:10",
  },
  {
    id: "TCK-005",
    subject: "Request for account deletion",
    user: "michael_brown",
    status: "in-progress",
    priority: "low",
    createdAt: "2025-05-03 10:48",
    lastUpdated: "2025-05-04 09:15",
  },
];

export const AdminSupport = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickets">
        <TabsList className="mb-6">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage user support requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Input placeholder="Search tickets..." className="max-w-sm" />
                <div className="flex gap-2">
                  <select className="h-10 border border-input rounded-md px-3">
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select className="h-10 border border-input rounded-md px-3">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell>{ticket.user}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ticket.status === "open" ? "bg-yellow-500" :
                              ticket.status === "in-progress" ? "bg-blue-500" :
                              "bg-green-500"
                            }
                          >
                            {ticket.status === "in-progress" ? "In Progress" : 
                            ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ticket.priority === "high" 
                                ? "border-red-500 text-red-500" 
                                : ticket.priority === "medium"
                                ? "border-amber-500 text-amber-500"
                                : "border-gray-500 text-gray-500"
                            }
                          >
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.createdAt}</TableCell>
                        <TableCell>{ticket.lastUpdated}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            {ticket.status !== "closed" && (
                              <Button size="sm" variant="outline">
                                Close
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing 5 of 24 tickets
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Management</CardTitle>
              <CardDescription>Manage frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">FAQ Management Coming Soon</h3>
                <p className="text-muted-foreground">FAQ management features are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Review and analyze user feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Feedback System Coming Soon</h3>
                <p className="text-muted-foreground">User feedback features are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
