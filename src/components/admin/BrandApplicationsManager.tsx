import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';

interface BrandApplication {
  id: string;
  user_id: string;
  company_name: string;
  website: string;
  company_size: string;
  industry: string;
  task_types: string[];
  budget: string;
  goals: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  email_confirmed: boolean;
}

export const BrandApplicationsManager: React.FC = () => {
  const [applications, setApplications] = useState<BrandApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper type conversion
      const transformedData: BrandApplication[] = (data || []).map(app => ({
        id: app.id,
        user_id: app.user_id,
        company_name: app.company_name,
        website: app.website,
        company_size: app.company_size,
        industry: app.industry,
        task_types: Array.isArray(app.task_types) 
          ? app.task_types.map(item => String(item))
          : [],
        budget: app.budget,
        goals: app.goals,
        status: app.status as 'pending' | 'approved' | 'rejected',
        created_at: app.created_at,
        email_confirmed: app.email_confirmed
      }));
      
      setApplications(transformedData);
    } catch (error) {
      console.error('Error loading brand applications:', error);
      toast.error('Failed to load brand applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (applicationId: string, approved: boolean) => {
    setProcessingId(applicationId);
    try {
      const { error } = await supabase
        .from('brand_applications')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Application ${approved ? 'approved' : 'rejected'} successfully`);
      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Brand Applications</h2>
        <Badge variant="outline" className="text-yeild-yellow border-yeild-yellow">
          {applications.filter(app => app.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-yeild-yellow" />
                  <CardTitle className="text-white">{application.company_name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(application.status)} text-white`}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1 capitalize">{application.status}</span>
                  </Badge>
                  {!application.email_confirmed && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                      Email Unconfirmed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="text-white">{application.website || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Industry</p>
                  <p className="text-white">{application.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Company Size</p>
                  <p className="text-white">{application.company_size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Budget</p>
                  <p className="text-white">{application.budget}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Task Types</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.task_types.map((type, index) => (
                    <Badge key={index} variant="outline" className="text-white border-gray-600">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Goals</p>
                <p className="text-white">{application.goals}</p>
              </div>

              <div className="text-sm text-gray-400">
                Applied: {new Date(application.created_at).toLocaleDateString()}
              </div>

              {application.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApproval(application.id, true)}
                    disabled={processingId === application.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(application.id, false)}
                    disabled={processingId === application.id}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No brand applications found</p>
        </div>
      )}
    </div>
  );
};
