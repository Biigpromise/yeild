
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BrandApplication = {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  company_size: string;
  industry: string;
  budget: string;
  goals: string;
};

interface BrandApplicationsTableProps {
  applications: BrandApplication[];
  onUpdateStatus: (applicationId: string, userId: string, newStatus: 'approved' | 'rejected') => void;
}

export const BrandApplicationsTable: React.FC<BrandApplicationsTableProps> = ({
  applications,
  onUpdateStatus
}) => {
  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Company Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="font-medium">{app.company_name}</div>
                {app.website && (
                  <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
                    {app.website}
                  </a>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Size:</span> {app.company_size}</div>
                  <div><span className="font-medium">Industry:</span> {app.industry}</div>
                  <div><span className="font-medium">Budget:</span> {app.budget}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                   app.status === 'approved' ? 'default' : 
                   app.status === 'rejected' ? 'destructive' : 'secondary'
                 }>
                   {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                 </Badge>
              </TableCell>
              <TableCell>
                {new Date(app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(app.id, app.user_id, 'approved')} 
                    disabled={app.status !== 'pending'}
                    variant={app.status === 'approved' ? 'outline' : 'default'}
                  >
                    {app.status === 'approved' ? 'Approved' : 'Approve'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => onUpdateStatus(app.id, app.user_id, 'rejected')} 
                    disabled={app.status !== 'pending'}
                  >
                    {app.status === 'rejected' ? 'Rejected' : 'Reject'}
                  </Button>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
             <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No brand applications found. Applications will appear here once brands sign up.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
