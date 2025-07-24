import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Globe, Users, DollarSign, Target, Calendar } from 'lucide-react';
import { type BrandApplication } from '@/hooks/useBrandApplications';

interface BrandApplicationDetailsDialogProps {
  application: BrandApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BrandApplicationDetailsDialog: React.FC<BrandApplicationDetailsDialogProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6" />
            {application.company_name}
            <Badge className={getStatusColor(application.status)}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Company Name</label>
                  <p className="text-lg font-medium">{application.company_name}</p>
                </div>
                {application.website && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Website</label>
                    <a 
                      href={application.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-4 w-4" />
                      {application.website}
                    </a>
                  </div>
                )}
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Industry</label>
                  <p>{application.industry}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Company Size</label>
                  <p className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {application.company_size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Budget Range
                </label>
                <p className="text-lg">{application.budget}</p>
              </div>
              
              {application.task_types && (
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Task Types</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(application.task_types) ? 
                      application.task_types.map((type: string, index: number) => (
                        <Badge key={index} variant="outline">{type}</Badge>
                      )) :
                      <Badge variant="outline">{application.task_types}</Badge>
                    }
                  </div>
                </div>
              )}

              <div>
                <label className="font-medium text-sm text-muted-foreground">Goals</label>
                <p className="mt-1 text-sm leading-relaxed">{application.goals}</p>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Application Submitted:</span>
                  <span>{new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};