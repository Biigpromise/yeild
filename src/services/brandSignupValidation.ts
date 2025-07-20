
import { supabase } from "@/integrations/supabase/client";

// Utility function to check if company name or email exists
export async function checkFieldUniqueness(field: 'companyName' | 'email', value: string) {
  try {
    if (field === "companyName") {
      const { data, error } = await supabase
        .from("brand_applications")
        .select("id")
        .eq("company_name", value)
        .limit(1);
      if (error) {
        console.warn(`Error checking company name uniqueness`, error);
        return false;
      }
      return data && data.length > 0;
    }
    if (field === "email") {
      // For email uniqueness, we'll let Supabase handle the validation during signup
      // since we can't directly query auth.users and profiles might not exist yet
      // This will be caught by the signUp method with proper error handling
      return false;
    }
  } catch (error) {
    console.warn(`Error checking ${field} uniqueness:`, error);
    return false;
  }
  return false;
}
