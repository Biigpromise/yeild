
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const methods = await adminFinancialService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMethod = async () => {
    if (!editingMethod) return;
    try {
      const { id, ...updateData } = editingMethod;
      const success = await adminFinancialService.updatePaymentMethod(
        id, 
        updateData
      );
      if (success) {
        loadPaymentMethods();
        setIsDialogOpen(false);
        setEditingMethod(null);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const getMethodIcon = (methodKey: string) => {
    switch (methodKey) {
      case 'paypal': return <CreditCard className="h-5 w-5" />;
      case 'bank_transfer': return <Banknote className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      case 'gift_card': return <Gift className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
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
            <Button variant="outline" size="sm" onClick={loadPaymentMethods} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                        {getMethodIcon(method.methodKey)}
                        <span className="font-medium">
                          {method.name}
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
                    <TableCell>{method.processingFeePercent}%</TableCell>
                    <TableCell>{method.processingTimeEstimate}</TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && editingMethod?.id === method.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingMethod(null);
                        }
                        setIsDialogOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingMethod(method);
                              setIsDialogOpen(true);
                            }}
                          >
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          {editingMethod && (
                            <>
                              <DialogHeader>
                                <DialogTitle>
                                  Configure {editingMethod.name}
                                </DialogTitle>
                              </DialogHeader>
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
                                    value={editingMethod.processingFeePercent}
                                    onChange={(e) => setEditingMethod({
                                      ...editingMethod, 
                                      processingFeePercent: parseFloat(e.target.value) || 0
                                    })}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Processing Time
                                  </label>
                                  <Input
                                    value={editingMethod.processingTimeEstimate || ''}
                                    onChange={(e) => setEditingMethod({
                                      ...editingMethod, 
                                      processingTimeEstimate: e.target.value
                                    })}
                                    placeholder="e.g., 1-3 business days"
                                  />
                                </div>

                                <Button 
                                  onClick={handleUpdateMethod}
                                  className="w-full"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                              </div>
                            </>
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
