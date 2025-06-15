
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
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!user) {
        setCheckingStatus(false);
        setApplication(null);
        return;
    }

    const fetchApplication = async () => {
        setCheckingStatus(true);
        const { data, error } = await supabase
          .from('brand_applications')
          .select('id, company_name, status, created_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
            console.error("Error fetching brand application:", error);
        } else if (data) {
          setApplication(data as BrandApplication);
        }
        setCheckingStatus(false);
    };

    fetchApplication();
  }, [user]);

  return { application, checkingStatus };
};
