
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";
import { PaymentMethodConfig } from "@/services/admin/adminFinancialService";
import { usePaymentMethods } from "./hooks/usePaymentMethods";
import { PaymentMethodsTable } from "./PaymentMethodsTable";
import { PaymentMethodEditDialog } from "./PaymentMethodEditDialog";

export const PaymentMethodManager = () => {
  const { paymentMethods, loading, loadPaymentMethods, updateMethod } = usePaymentMethods();
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfigure = (method: PaymentMethodConfig) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingMethod(null);
    }
    setIsDialogOpen(open);
  }

  const handleSave = async (method: PaymentMethodConfig) => {
    const success = await updateMethod(method);
    if (success) {
      setIsDialogOpen(false);
      setEditingMethod(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payment Method Configuration
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => loadPaymentMethods()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payment methods...</div>
          ) : (
            <PaymentMethodsTable
              paymentMethods={paymentMethods}
              onConfigure={handleConfigure}
            />
          )}
        </CardContent>
      </Card>

      <PaymentMethodEditDialog
        method={editingMethod}
        isOpen={isDialogOpen}
        onOpenChange={handleOpenChange}
        onSave={handleSave}
      />
    </div>
  );
};
