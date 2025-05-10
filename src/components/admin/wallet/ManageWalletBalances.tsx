
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const ManageWalletBalances: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  
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

  return (
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
  );
};
