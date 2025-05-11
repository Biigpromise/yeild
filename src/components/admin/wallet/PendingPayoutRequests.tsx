
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { PayoutRequest } from "./types";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/ui/loading-state";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

type PendingPayoutRequestsProps = {
  requests: PayoutRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
};

export const PendingPayoutRequests: React.FC<PendingPayoutRequestsProps> = ({ 
  requests, 
  onApprove, 
  onReject,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRequests, setFilteredRequests] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    const pendingReqs = requests.filter(req => req.status === "pending" || req.status === "processing");
    
    if (searchQuery.trim() === "") {
      setFilteredRequests(pendingReqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = pendingReqs.filter(req => 
      req.userName.toLowerCase().includes(query) || 
      req.amount.toString().includes(query) ||
      req.method.toLowerCase().includes(query) ||
      req.requestDate.includes(query)
    );
    
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput
          placeholder="Search by name, amount, or method..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-72"
        />
        <div className="flex space-x-2">
          <span className="text-sm text-muted-foreground">
            {filteredRequests.length} requests pending
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        {isLoading ? (
          <LoadingState text="Loading payout requests..." className="py-8" />
        ) : (
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
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.userName}</TableCell>
                  <TableCell>${request.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 rounded-full text-xs bg-slate-100">
                      {request.method}
                    </span>
                  </TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {request.taskCompleted ? (
                        <TooltipWrapper content="All required tasks have been completed and verified">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600 text-sm">Verified</span>
                          </div>
                        </TooltipWrapper>
                      ) : (
                        <TooltipWrapper content="Waiting for task completion verification">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-amber-600 text-sm">Pending</span>
                          </div>
                        </TooltipWrapper>
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
                      <TooltipWrapper content="User has been notified of payout status">
                        <span className="text-green-600 text-xs flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Synchronized
                        </span>
                      </TooltipWrapper>
                    ) : (
                      <TooltipWrapper content="Waiting for notification to be sent to user">
                        <span className="text-amber-600 text-xs flex items-center">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Pending sync
                        </span>
                      </TooltipWrapper>
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
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    {searchQuery ? "No matching payout requests found" : "No pending payout requests"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
