
import { toast } from "sonner";
import { checkFieldUniqueness } from "@/services/brandSignupValidation";
import { BrandSignupFormValues } from "@/hooks/useBrandSignupForm";
import { UseFormReturn } from "react-hook-form";

interface StepNavigationProps {
  form: UseFormReturn<BrandSignupFormValues>;
  onNextStep: () => void;
}

export async function handleNextStep({ form, onNextStep }: StepNavigationProps) {
  console.log("handleNextStep called");
  const fields: (keyof BrandSignupFormValues)[] = ["companyName", "email", "password", "companySize", "website"];
  
  // Trigger validation for step 1 fields
  const isValid = await form.trigger(fields, { shouldFocus: true });
  console.log("Form validation result:", isValid);
  console.log("Form errors:", form.formState.errors);
  
  if (!isValid) {
    console.log("Form validation failed, not proceeding");
    toast.error("Please fix the errors before continuing");
    return;
  }

  const formValues = form.getValues();
  console.log("Form values:", formValues);

  try {
    // Check uniqueness
    const companyExists = await checkFieldUniqueness("companyName", formValues.companyName);
    const emailExists = await checkFieldUniqueness("email", formValues.email);
    
    console.log("Company exists:", companyExists, "Email exists:", emailExists);

    if (companyExists) {
      form.setError("companyName", { type: "manual", message: "A company with this name already exists." });
      toast.error("A company with this name already exists");
      return;
    }
    
    if (emailExists) {
      form.setError("email", { type: "manual", message: "This email is already registered." });
      toast.error("This email is already registered");
      return;
    }

    console.log("Proceeding to step 2");
    onNextStep();
    toast.success("Step 1 completed successfully");
  } catch (error) {
    console.error("Error in handleNextStep:", error);
    toast.error("An error occurred. Please try again.");
  }
}
