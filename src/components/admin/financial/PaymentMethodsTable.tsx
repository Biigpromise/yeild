
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentMethodConfig } from "@/services/admin/adminFinancialService";
import { CreditCard, Bitcoin, Banknote, Gift } from "lucide-react";

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethodConfig[];
  onConfigure: (method: PaymentMethodConfig) => void;
}

const getMethodIcon = (methodKey: string) => {
  switch (methodKey) {
    case 'paypal': return <CreditCard className="h-5 w-5" />;
    case 'bank_transfer': return <Banknote className="h-5 w-5" />;
    case 'crypto': return <Bitcoin className="h-5 w-5" />;
    case 'gift_card': return <Gift className="h-5 w-5" />;
    default: return <CreditCard className="h-5 w-5" />;
  }
};

export const PaymentMethodsTable = ({
  paymentMethods,
  onConfigure
}: PaymentMethodsTableProps) => {
  return (
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => onConfigure(method)}
              >
                Configure
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
