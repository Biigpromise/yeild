
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, X, Filter } from "lucide-react";
import { PayoutRequest } from "./types";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

type PayoutHistoryProps = {
  requests: PayoutRequest[];
  isLoading?: boolean;
};

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({ 
  requests,
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "rejected">("all");
  const [filteredRequests, setFilteredRequests] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    // Get all completed requests first
    let completedReqs = requests.filter(req => req.status !== "pending" && req.status !== "processing");
    
    // Apply status filter
    if (statusFilter !== "all") {
      completedReqs = completedReqs.filter(req => req.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() === "") {
      setFilteredRequests(completedReqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = completedReqs.filter(req => 
      req.userName.toLowerCase().includes(query) || 
      req.amount.toString().includes(query) ||
      req.method.toLowerCase().includes(query) ||
      req.requestDate.includes(query) ||
      (req.processingDate && req.processingDate.includes(query))
    );
    
    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, requests]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput
          placeholder="Search history..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-72"
        />
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground mr-2 flex items-center">
            <Filter className="h-3 w-3 mr-1" /> Filter:
          </span>
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-3 py-1 rounded-none ${statusFilter === 'all' ? 'bg-muted' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-3 py-1 rounded-none ${statusFilter === 'approved' ? 'bg-muted' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-3 py-1 rounded-none ${statusFilter === 'rejected' ? 'bg-muted' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        {isLoading ? (
          <LoadingState text="Loading payout history..." className="py-8" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead>User Notified</TableHead>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "approved" 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{request.processingDate || "N/A"}</TableCell>
                  <TableCell>
                    {request.notificationSent ? (
                      <TooltipWrapper content="User has been notified of this payout status">
                        <span className="text-green-600 text-xs flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Notified
                        </span>
                      </TooltipWrapper>
                    ) : (
                      <TooltipWrapper content="User has not been notified of this payout status">
                        <span className="text-amber-600 text-xs flex items-center">
                          <X className="h-3 w-3 mr-1" />
                          Not sent
                        </span>
                      </TooltipWrapper>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    {searchQuery || statusFilter !== "all" 
                      ? "No matching payout history found" 
                      : "No payout history available"}
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
