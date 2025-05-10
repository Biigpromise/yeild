
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayoutRequest } from "./types";

type PayoutHistoryProps = {
  requests: PayoutRequest[];
};

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({ requests }) => {
  const completedRequests = requests.filter(req => req.status !== "pending" && req.status !== "processing");

  return (
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
          {completedRequests.map((request) => (
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
          {completedRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No payout history available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
