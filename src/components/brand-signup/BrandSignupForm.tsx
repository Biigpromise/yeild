import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import FormStepOne from "@/components/brand-signup/FormStepOne";
import FormStepTwo from "@/components/brand-signup/FormStepTwo";
import ProgressSteps from "@/components/brand-signup/ProgressSteps";

const formSchema = z
  .object({
    companyName: z.string().min(1, { message: "Company name is required." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    companySize: z.string().min(1, { message: "Please select a company size." }),
    industry: z.string().min(1, { message: "Please select your industry." }),
    taskTypes: z.object({
      surveys: z.boolean().default(false),
      appTesting: z.boolean().default(false),
      contentCreation: z.boolean().default(false),
      productReviews: z.boolean().default(false),
      focusGroups: z.boolean().default(false),
    }).default({}),
    budget: z.string().min(1, { message: "Please select a budget." }),
    goals: z.string().min(1, { message: "Please describe your campaign goals." }),
    agreeTerms: z.boolean(),
  })
  .refine(data => data.agreeTerms, {
    message: "You must agree to the Terms of Service and Privacy Policy.",
    path: ["agreeTerms"],
  });

type BrandSignupFormValues = z.infer<typeof formSchema>;

const BrandSignupForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<BrandSignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
      website: "",
      companySize: "",
      industry: "",
      taskTypes: {
        surveys: false,
        appTesting: false,
        contentCreation: false,
        productReviews: false,
        focusGroups: false,
      },
      budget: "",
      goals: "",
      agreeTerms: false,
    },
    mode: "onChange",
  });

  const handleNextStep = async () => {
    const fields: (keyof BrandSignupFormValues)[] = ["companyName", "email", "password", "companySize", "website"];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    setStep(2);
  };

  const onSubmit = async (data: BrandSignupFormValues) => {
    setIsLoading(true);
    try {
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
        { brand_application_data: applicationData }
      );

      if (signUpError) {
        toast.error(signUpError.message || "Could not create account. Please try again.");
        setIsLoading(false);
        return;
      }
      
      toast.success("Application submitted successfully!");

    } catch (error) {
      console.error("An unexpected error occurred during signup:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <span className="text-yeild-yellow text-3xl font-bold lg:hidden">YEILD</span>
        <h1 className="text-2xl font-bold mt-2">Brand Partnership Application</h1>
        <p className="text-gray-400 mt-2">Connect with our engaged community of users</p>
      </div>

      <ProgressSteps step={step} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && <FormStepOne form={form} />}
          {step === 2 && <FormStepTwo form={form} />}
          
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-800">
            {step === 1 ? (
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            ) : (
              <Button type="button" variant="outline" className="yeild-btn-secondary" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
            )}

            {step === 1 && (
              <Button type="button" className="yeild-btn-primary" onClick={handleNextStep}>
                Continue
              </Button>
            )}
            
            {step === 2 && (
              <Button type="submit" className="yeild-btn-primary" disabled={isLoading}>
                {isLoading ? "Processing..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Already have a brand account?{" "}
          <Link to="/login" className="font-semibold text-yeild-yellow hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
};

export default BrandSignupForm;
