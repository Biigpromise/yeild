import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { BrandApplication } from '@/hooks/useBrandApplicationStatus';

const StatusInfo = ({ status }: { status: BrandApplication['status'] }) => {
    const navigate = useNavigate();

    if (status === 'approved') {
        return {
            icon: <CheckCircle className="h-16 w-16 text-green-500" />,
            title: "Application Approved!",
            description: "Congratulations! You can now access all brand features.",
            badgeVariant: 'success' as const,
            action: <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        };
    }
    if (status === 'rejected') {
        return {
            icon: <XCircle className="h-16 w-16 text-destructive" />,
            title: "Application Status",
            description: "We regret to inform you that your application has not been approved at this time. For more details, please contact support.",
            badgeVariant: 'destructive' as const,
            action: <Button variant="outline" onClick={() => navigate('/support')}>Contact Support</Button>
        };
    }
    return { // pending
        icon: <Clock className="h-16 w-16 text-yellow-500" />,
        title: "Application Pending",
        description: "Your application is currently under review. We will notify you via email once a decision has been made. This usually takes 2-3 business days.",
        badgeVariant: 'secondary' as const,
        action: null
    };
};

export const BrandApplicationStatus = ({ application }: { application: BrandApplication }) => {
  const navigate = useNavigate();
  const statusInfo = StatusInfo({ status: application.status });

  return (
    <Card className="w-full max-w-2xl bg-transparent border-0 shadow-none">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
                {statusInfo.icon}
            </div>
            <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
            <div className="flex justify-center mt-2">
                <Badge variant={statusInfo.badgeVariant} className="text-sm">
                    Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-gray-400 mb-8 max-w-md mx-auto">{statusInfo.description}</p>
            <div className="space-y-2 text-left text-sm text-gray-400 bg-gray-800/50 p-4 rounded-md">
                <p><strong>Company:</strong> {application.company_name}</p>
                <p><strong>Application Date:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
            </div>
             <div className="mt-8 flex gap-4 justify-center">
                {statusInfo.action}
                <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
        </CardContent>
    </Card>
  );
};
