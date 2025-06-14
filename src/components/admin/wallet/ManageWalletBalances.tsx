
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const ManageWalletBalances: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  
  const handleAwardPoints = () => {
    if (!userId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both user ID and point amount",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Points Awarded",
      description: `Successfully awarded ${amount} points to user ${userId}`,
    });
    setUserId("");
    setAmount("");
  };
  
  const handleDeductPoints = () => {
    if (!userId || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both user ID and point amount",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Points Deducted",
      description: `Successfully deducted ${amount} points from user ${userId}`,
    });
    setUserId("");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Point Management System</h3>
        <p className="text-sm text-blue-700 mb-2">
          Users earn points by completing tasks. Each level increases earning capacity by 4%.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">1000 points = $1 USD</Badge>
          <Badge variant="outline">Level multiplier: +4% per level</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Award Points to User</CardTitle>
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
                <label className="block text-sm font-medium mb-1">Points Amount</label>
                <Input 
                  type="number" 
                  placeholder="Enter points amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleAwardPoints} className="w-full">Award Points</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deduct Points from User</CardTitle>
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
                <label className="block text-sm font-medium mb-1">Points Amount</label>
                <Input 
                  type="number" 
                  placeholder="Enter points amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDeductPoints} 
                variant="outline" 
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              >
                Deduct Points
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
