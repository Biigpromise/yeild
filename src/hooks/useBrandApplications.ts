
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BrandApplication = {
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
  task_types: any;
};

export const useBrandApplications = () => {
  const [applications, setApplications] = useState<BrandApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrandApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching brand applications...');
      
      const { data, error } = await supabase
        .from('brand_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching brand applications:", error);
        toast.error("Failed to load brand applications: " + error.message);
        setApplications([]);
      } else {
        console.log('Brand applications fetched:', data);
        setApplications(data as BrandApplication[]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      console.log(`Updating application ${applicationId} to ${newStatus}`);
      
      // First, update the application status
      const { error: statusError } = await supabase
        .from('brand_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (statusError) {
        console.error("Error updating status:", statusError);
        toast.error(`Failed to ${newStatus} application: ${statusError.message}`);
        return;
      }
      
      // If approved, assign the 'brand' role to the user
      if (newStatus === 'approved') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'brand' });

        if (roleError && roleError.code !== '23505') { // 23505 is unique violation, meaning role already exists
          console.error("Error assigning role:", roleError);
          toast.error("Application approved, but failed to assign 'brand' role: " + roleError.message);
        } else {
          toast.success("Application approved and 'brand' role assigned.");
        }
      } else {
        toast.success(`Application has been ${newStatus}.`);
      }

      // Refresh the data to show updated status
      fetchBrandApplications();
    } catch (error) {
      console.error("Unexpected error updating status:", error);
      toast.error("An unexpected error occurred while updating status");
    }
  };

  useEffect(() => {
    fetchBrandApplications();

    const channel = supabase
      .channel('admin-brand-applications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'brand_applications' },
        (payload) => {
          console.log('New brand application received:', payload);
          toast.info("New brand application received!");
          setApplications((prev) => [payload.new as BrandApplication, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'brand_applications' },
        (payload) => {
          console.log('Brand application updated:', payload);
          setApplications((prev) =>
            prev.map((app) =>
              app.id === payload.new.id ? (payload.new as BrandApplication) : app
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    applications,
    loading,
    handleUpdateStatus,
    fetchBrandApplications
  };
};
