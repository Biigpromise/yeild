
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReferralLevel {
  id: string;
  name: string;
  required_referrals: number;
  rewards_description: string | null;
  color: string | null;
  created_at?: string;
  updated_at?: string;
}

export const adminReferralService = {
  async getReferralLevels(): Promise<ReferralLevel[]> {
    const { data, error } = await supabase
      .from("referral_levels")
      .select("*")
      .order("required_referrals", { ascending: true });

    if (error) {
      console.error("Error fetching referral levels:", error);
      toast.error("Failed to fetch referral levels.");
      throw error;
    }
    return data;
  },

  async updateReferralLevel(
    id: string,
    updateData: Partial<Omit<ReferralLevel, "id">>
  ): Promise<ReferralLevel> {
    const { data, error } = await supabase
      .from("referral_levels")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating referral level:", error);
      toast.error("Failed to update referral level.");
      throw error;
    }
    toast.success("Referral level updated successfully.");
    return data;
  },
};
