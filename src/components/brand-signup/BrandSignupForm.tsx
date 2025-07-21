
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import FormStepOne from "@/components/brand-signup/FormStepOne";
import FormStepTwo from "@/components/brand-signup/FormStepTwo";
import ProgressSteps from "@/components/brand-signup/ProgressSteps";
import SubmittedScreen from "@/components/brand-signup/SubmittedScreen";
import { useBrandSignupForm } from "@/hooks/useBrandSignupForm";
import { handleNextStep } from "@/components/brand-signup/StepNavigation";
import { useFormSubmission } from "@/components/brand-signup/FormSubmissionHandler";

const BrandSignupForm = () => {
  const navigate = useNavigate();
  const {
    form,
    step,
    setStep,
    submitted,
    setSubmitted,
    submittedEmail,
    setSubmittedEmail,
    submittedCompany,
    setSubmittedCompany,
    clearDraft,
  } = useBrandSignupForm();

  const { onSubmit, isLoading } = useFormSubmission({
    onSubmissionComplete: (email, company) => {
      setSubmittedEmail(email);
      setSubmittedCompany(company);
      setSubmitted(true);
    },
    clearDraft,
  });

  const handleNext = () => {
    handleNextStep({ form, onNextStep: () => setStep(2) });
  };

  if (submitted) {
    return (
      <SubmittedScreen email={submittedEmail} company={submittedCompany} />
    );
  }

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
          {step === 1 && (
            <FormStepOne form={form} />
          )}
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
              <Button type="button" className="yeild-btn-primary" onClick={handleNext}>
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
