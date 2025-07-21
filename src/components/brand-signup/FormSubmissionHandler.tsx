
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
      // Email uniqueness will be handled by Supabase during signup
      const applicationData = {
        companyName: data.companyName,
        website: data.website,
        companySize: data.companySize,
        industry: data.industry,
        taskTypes: data.taskTypes,
        budget: data.budget,
        goals: data.goals,
      };

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

      // Always save submitted company and email for resend
      onSubmissionComplete(data.email, data.companyName);

      try {
        const { error: emailError } = await supabase.functions.invoke('send-brand-confirmation-email', {
          body: { email: data.email, companyName: data.companyName },
        });
        if (emailError) throw emailError;
        toast.success("Application submitted! Please check your email to confirm your account.");
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        toast.warning("Your application was submitted, but we had an issue sending the confirmation email. Please contact support if you don't receive it.");
      }
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
