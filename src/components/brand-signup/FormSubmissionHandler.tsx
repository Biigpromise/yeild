
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { checkFieldUniqueness } from "@/services/brandSignupValidation";
import { BrandSignupFormValues } from "@/hooks/useBrandSignupForm";

interface FormSubmissionHandlerProps {
  onSubmissionComplete: (email: string, company: string) => void;
  clearDraft: () => void;
}

export function useFormSubmission({ onSubmissionComplete, clearDraft }: FormSubmissionHandlerProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: BrandSignupFormValues) => {
    console.log("Form submission started");
    setIsLoading(true);
    try {
      if (await checkFieldUniqueness("companyName", data.companyName)) {
        toast.error("A company with this name already exists.");
        setIsLoading(false);
        return;
      }
      
      const applicationData = {
        companyName: data.companyName,
        website: data.website,
        companySize: data.companySize,
        industry: data.industry,
        taskTypes: data.taskTypes,
        budget: data.budget,
        goals: data.goals,
      };

      // The signUp function in useAuthOperations already handles sending the brand confirmation email
      // so we don't need to send it again here - it will only be sent once during signup
      const { error: signUpError } = await signUp(
        data.email,
        data.password,
        data.companyName,
        'brand',
        { brand_application_data: applicationData }
      );

      if (signUpError) {
        toast.error(signUpError.message || "Could not create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Save submitted company and email for potential resend (though resend should be rare)
      onSubmissionComplete(data.email, data.companyName);
      toast.success("Application submitted! Please check your email to confirm your account.");
      clearDraft();
    } catch (error) {
      console.error("An unexpected error occurred during signup:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading };
}
