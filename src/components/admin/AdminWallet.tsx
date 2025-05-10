
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { Bell, Settings, Circle, CheckCircle, AlertCircle } from "lucide-react";

const data = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 8000 },
  { name: 'May', amount: 7000 },
  { name: 'Jun', amount: 9000 },
  { name: 'Jul', amount: 11000 },
];

type PayoutRequest = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing";
  requestDate: string;
  method: "paypal" | "bank" | "crypto";
  taskCompleted?: boolean;
};

type AutomationSetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "1",
    userId: "u123",
    userName: "John Doe",
    amount: 250,
    status: "pending",
    requestDate: "2025-05-05",
    method: "paypal",
    taskCompleted: true,
  },
  {
    id: "2",
    userId: "u456",
    userName: "Jane Smith",
    amount: 175,
    status: "approved",
    requestDate: "2025-05-04",
    method: "bank",
    taskCompleted: true,
  },
  {
    id: "3",
    userId: "u789",
    userName: "Robert Johnson",
    amount: 350,
    status: "rejected",
    requestDate: "2025-05-03",
    method: "crypto",
    taskCompleted: false,
  },
  {
    id: "4",
    userId: "u101",
    userName: "Lisa Brown",
    amount: 425,
    status: "processing",
    requestDate: "2025-05-02",
    method: "paypal",
    taskCompleted: true,
  },
];

const automationSettings: AutomationSetting[] = [
  {
    id: "auto-approval",
    name: "Automatic Payout Approval",
    description: "Automatically approve payouts when tasks are verified as completed",
    enabled: true
  },
  {
    id: "threshold-limit",
    name: "Threshold Approval",
    description: "Auto-approve payouts below a certain threshold (currently $300)",
    enabled: true
  },
  {
    id: "instant-processing",
    name: "Instant Processing",
    description: "Process approved payouts immediately without admin review",
    enabled: false
  },
  {
    id: "verification-hold",
    name: "Verification Hold",
    description: "Hold payouts for 24 hours for fraud prevention checks",
    enabled: true
  }
];

export const AdminWallet = () => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [settings, setSettings] = useState<AutomationSetting[]>(automationSettings);
  const { toast } = useToast();
  
  const pendingRequests = payoutRequests.filter(r => r.status === "pending" || r.status === "processing");
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalProcessedAmount = payoutRequests
    .filter(r => r.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0);
  
  // Auto-process payouts based on completed tasks
  useEffect(() => {
    if (settings.find(s => s.id === "auto-approval")?.enabled) {
      const timer = setTimeout(() => {
        processAutomatedPayouts();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [payoutRequests]);
  
  const processAutomatedPayouts = () => {
    const thresholdEnabled = settings.find(s => s.id === "threshold-limit")?.enabled;
    const threshold = 300; // $300 threshold
    
    const updatedRequests = payoutRequests.map(req => {
      if (req.status === "pending" && req.taskCompleted) {
        // Auto-approve if task is completed and either below threshold or threshold check is disabled
        if (!thresholdEnabled || req.amount <= threshold) {
          toast({
            title: "Payout Auto-Approved",
            description: `$${req.amount} payout to ${req.userName} was automatically approved`,
          });
          return { ...req, status: "processing" };
        }
      }
      return req;
    });
    
    setPayoutRequests(updatedRequests);
  };
  
  const handleFundUser = () => {
    if (!userId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both user ID and amount",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "User Funded",
      description: `Successfully funded user ${userId} with $${amount}`,
    });
    setUserId("");
    setAmount("");
  };
  
  const handleDeductUser = () => {
    if (!userId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both user ID and amount",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Amount Deducted",
      description: `Successfully deducted $${amount} from user ${userId}`,
    });
    setUserId("");
    setAmount("");
  };
  
  const handleApproveRequest = (id: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id ? { ...req, status: "approved" } : req
    ));
    
    toast({
      title: "Payout Approved",
      description: "The payout request has been approved and is being processed",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id ? { ...req, status: "rejected" } : req
    ));
    
    toast({
      title: "Payout Rejected",
      description: "The payout request has been rejected",
      variant: "destructive"
    });
  };
  
  const toggleAutomation = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
    
    const setting = settings.find(s => s.id === id);
    if (setting) {
      toast({
        title: setting.enabled ? "Automation Disabled" : "Automation Enabled",
        description: `${setting.name} has been ${setting.enabled ? 'disabled' : 'enabled'}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Platform Balance</p>
                <h2 className="text-4xl font-bold text-yellow-500">$47,580</h2>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <p className="text-xl font-semibold">${totalPendingAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-xl font-semibold">${totalProcessedAmount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payout Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#FFDE59" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payout Automation Settings</CardTitle>
          <CardDescription>Configure how payouts are automatically processed when tasks are completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-0.5">
                  <h3 className="text-base font-medium">{setting.name}</h3>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch 
                  checked={setting.enabled}
                  onCheckedChange={() => toggleAutomation(setting.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests">
            <TabsList className="mb-4">
              <TabsTrigger value="requests">Payout Requests</TabsTrigger>
              <TabsTrigger value="manage">Manage Balances</TabsTrigger>
              <TabsTrigger value="history">Payout History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests">
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Task Status</TableHead>
                      <TableHead>Payout Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.filter(req => req.status === "pending" || req.status === "processing").map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.userName}</TableCell>
                        <TableCell>${request.amount}</TableCell>
                        <TableCell className="capitalize">{request.method}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {request.taskCompleted ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-600 text-sm">Verified</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                                <span className="text-amber-600 text-sm">Pending</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "processing" ? "bg-blue-100 text-blue-800" : ""
                          }`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={request.status === "processing"}
                            >
                              {request.status === "processing" ? "Processing" : "Approve"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={request.status === "processing"}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payoutRequests.filter(req => req.status === "pending" || req.status === "processing").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No pending payout requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="manage">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fund User Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">User ID/Email</label>
                        <Input 
                          placeholder="Enter user ID or email" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleFundUser} className="w-full">Fund User</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Deduct from User Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">User ID/Email</label>
                        <Input 
                          placeholder="Enter user ID or email" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleDeductUser} 
                        variant="outline" 
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                      >
                        Deduct from User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.filter(req => req.status !== "pending" && req.status !== "processing").map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.userName}</TableCell>
                        <TableCell>${request.amount}</TableCell>
                        <TableCell className="capitalize">{request.method}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "approved" 
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>{request.status === "approved" ? "2025-05-06" : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
