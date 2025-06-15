
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type BrandApplication = {
  id: string;
  company_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export const useBrandApplicationStatus = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState<BrandApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        setApplication(null);
        return;
    }

    const fetchApplication = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('brand_applications')
          .select('id, company_name, status, created_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (fetchError) {
            console.error("Error fetching brand application:", fetchError);
            setError(fetchError);
        } else if (data) {
          setApplication(data as BrandApplication);
        }
        setIsLoading(false);
    };

    fetchApplication();

    const channel = supabase
      .channel(`brand-application-status-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'brand_applications', 
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setApplication(payload.new as BrandApplication);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { application, isLoading, error };
};
