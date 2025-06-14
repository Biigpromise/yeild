
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Bitcoin, 
  Banknote, 
  Gift,
  Settings,
  Save,
  RefreshCw
} from "lucide-react";
import { adminFinancialService, PaymentMethodConfig } from "@/services/admin/adminFinancialService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const PaymentMethodManager = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await adminFinancialService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMethod = async (method: PaymentMethodConfig) => {
    try {
      const success = await adminFinancialService.updatePaymentMethod(
        method.id, 
        method
      );
      if (success) {
        loadPaymentMethods();
        setEditingMethod(null);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal': return <CreditCard className="h-5 w-5" />;
      case 'bank_transfer': return <Banknote className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      case 'gift_card': return <Gift className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const formatMethodName = (method: string) => {
    switch (method) {
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Bank Transfer';
      case 'crypto': return 'Cryptocurrency';
      case 'gift_card': return 'Gift Cards';
      default: return method;
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
            <Button variant="outline" size="sm" onClick={loadPaymentMethods}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payment methods...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Processing Fee</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getMethodIcon(method.method)}
                        <span className="font-medium">
                          {formatMethodName(method.method)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>{method.minAmount.toLocaleString()} pts</TableCell>
                    <TableCell>{method.maxAmount.toLocaleString()} pts</TableCell>
                    <TableCell>{method.processingFee}%</TableCell>
                    <TableCell>{method.processingTime}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingMethod(method)}
                          >
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Configure {formatMethodName(method.method)}
                            </DialogTitle>
                          </DialogHeader>
                          {editingMethod && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Enabled</label>
                                <Switch
                                  checked={editingMethod.enabled}
                                  onCheckedChange={(enabled) => 
                                    setEditingMethod({...editingMethod, enabled})
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Minimum Amount (points)
                                </label>
                                <Input
                                  type="number"
                                  value={editingMethod.minAmount}
                                  onChange={(e) => setEditingMethod({
                                    ...editingMethod, 
                                    minAmount: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Maximum Amount (points)
                                </label>
                                <Input
                                  type="number"
                                  value={editingMethod.maxAmount}
                                  onChange={(e) => setEditingMethod({
                                    ...editingMethod, 
                                    maxAmount: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Processing Fee (%)
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={editingMethod.processingFee}
                                  onChange={(e) => setEditingMethod({
                                    ...editingMethod, 
                                    processingFee: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Processing Time
                                </label>
                                <Input
                                  value={editingMethod.processingTime}
                                  onChange={(e) => setEditingMethod({
                                    ...editingMethod, 
                                    processingTime: e.target.value
                                  })}
                                  placeholder="e.g., 1-3 business days"
                                />
                              </div>

                              <Button 
                                onClick={() => handleUpdateMethod(editingMethod)}
                                className="w-full"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
