
import { BrandApplicationStatus } from "@/components/brand-signup/BrandApplicationStatus";
import BrandSignupForm from "@/components/brand-signup/BrandSignupForm";
import { LoadingState } from "@/components/ui/loading-state";
import { useBrandApplicationStatus } from "@/hooks/useBrandApplicationStatus";

const BrandSignup = () => {
  const { application, isLoading, error } = useBrandApplicationStatus();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingState /></div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandApplicationStatus application={application} />
      </div>
    );
  }

  // If there is no application, show the form to create one.
  return <BrandSignupForm />;
};

export default BrandSignup;
