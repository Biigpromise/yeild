import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export const AdminFlutterwaveStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    mode: 'LIVE' | 'TEST';
    configured: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFlutterwaveStatus();
  }, []);

  const checkFlutterwaveStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('flutterwave-live-keys');
      
      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error('Error checking Flutterwave status:', error);
      setStatus({
        mode: 'TEST',
        configured: false,
        message: 'Error checking configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flutterwave Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Flutterwave Status
          <Badge variant={status?.mode === 'LIVE' ? 'default' : 'secondary'}>
            {status?.mode} Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configuration:</span>
            <Badge variant={status?.configured ? 'success' : 'destructive'}>
              {status?.configured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{status?.message}</p>
          {status?.mode === 'LIVE' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Live payments are enabled
              </p>
              <p className="text-xs text-green-600 mt-1">
                All payments will be processed in production mode
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};