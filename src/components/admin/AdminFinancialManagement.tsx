
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawalProcessor } from "./financial/WithdrawalProcessor";
import { PaymentMethodManager } from "./financial/PaymentMethodManager";
import { PaymentDashboard, AdminPayoutManager, PaymentTester } from "@/components/payments";
import { 
  CreditCard, 
  BarChart3, 
  Settings,
  Wallet
} from "lucide-react";

export const AdminFinancialManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Manage withdrawals, payment methods, and financial analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Withdrawals
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PaymentDashboard />
        </TabsContent>

        <TabsContent value="withdrawals">
          <WithdrawalProcessor />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethodManager />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentDashboard />
        </TabsContent>

        <TabsContent value="payouts">
          <AdminPayoutManager />
        </TabsContent>

        <TabsContent value="test">
          <PaymentTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};
