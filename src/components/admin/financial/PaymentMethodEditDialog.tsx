
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentMethodConfig } from "@/services/admin/adminFinancialService";
import { Save } from "lucide-react";

interface PaymentMethodEditDialogProps {
  method: PaymentMethodConfig | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (method: PaymentMethodConfig) => Promise<void>;
}

export const PaymentMethodEditDialog = ({
  method,
  isOpen,
  onOpenChange,
  onSave,
}: PaymentMethodEditDialogProps) => {
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  useEffect(() => {
    setEditingMethod(method ? { ...method } : null);
  }, [method]);

  if (!editingMethod) return null;

  const handleSave = async () => {
    await onSave(editingMethod);
  };

  const handleChange = (field: keyof PaymentMethodConfig, value: any) => {
    setEditingMethod(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Configure {editingMethod.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enabled</label>
            <Switch
              checked={editingMethod.enabled}
              onCheckedChange={(enabled) => handleChange('enabled', enabled)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Minimum Amount (points)
            </label>
            <Input
              type="number"
              value={editingMethod.minAmount}
              onChange={(e) => handleChange('minAmount', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Maximum Amount (points)
            </label>
            <Input
              type="number"
              value={editingMethod.maxAmount}
              onChange={(e) => handleChange('maxAmount', parseInt(e.target.value) || 0)}
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
              onChange={(e) => handleChange('processingFeePercent', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Processing Time
            </label>
            <Input
              value={editingMethod.processingTimeEstimate || ''}
              onChange={(e) => handleChange('processingTimeEstimate', e.target.value)}
              placeholder="e.g., 1-3 business days"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
