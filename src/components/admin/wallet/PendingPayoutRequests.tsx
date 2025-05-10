
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { PayoutRequest } from "./types";

type PendingPayoutRequestsProps = {
  requests: PayoutRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export const PendingPayoutRequests: React.FC<PendingPayoutRequestsProps> = ({ 
  requests, 
  onApprove, 
  onReject 
}) => {
  const pendingRequests = requests.filter(req => req.status === "pending" || req.status === "processing");

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Task Status</TableHead>
            <TableHead>Payout Status</TableHead>
            <TableHead>Sync Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.userName}</TableCell>
              <TableCell>${request.amount}</TableCell>
              <TableCell className="capitalize">{request.method}</TableCell>
              <TableCell>{request.requestDate}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {request.taskCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-amber-600 text-sm">Pending</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  request.status === "processing" ? "bg-blue-100 text-blue-800" : ""
                }`}>
                  {request.status}
                </span>
              </TableCell>
              <TableCell>
                {request.notificationSent ? (
                  <span className="text-green-600 text-xs flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Synchronized
                  </span>
                ) : (
                  <span className="text-amber-600 text-xs flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Pending sync
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    onClick={() => onApprove(request.id)}
                    disabled={request.status === "processing"}
                  >
                    {request.status === "processing" ? "Processing" : "Approve"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    onClick={() => onReject(request.id)}
                    disabled={request.status === "processing"}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {pendingRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No pending payout requests
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
