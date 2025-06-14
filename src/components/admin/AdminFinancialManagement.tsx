
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawalProcessor } from "./financial/WithdrawalProcessor";
import { PaymentMethodManager } from "./financial/PaymentMethodManager";
import { FinancialAnalytics } from "./financial/FinancialAnalytics";
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

      <Tabs defaultValue="withdrawals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Withdrawal Processing
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <WithdrawalProcessor />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethodManager />
        </TabsContent>

        <TabsContent value="analytics">
          <FinancialAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
