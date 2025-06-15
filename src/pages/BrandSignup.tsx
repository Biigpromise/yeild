
import { BrandApplicationStatus } from "@/components/brand-signup/BrandApplicationStatus";
import BrandSignupForm from "@/components/brand-signup/BrandSignupForm";
import BrandSignupPageLayout from "@/components/brand-signup/BrandSignupPageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useBrandApplicationStatus } from "@/hooks/useBrandApplicationStatus";

const BrandSignup = () => {
  const { application, isLoading, error } = useBrandApplicationStatus();

  if (isLoading) {
    return (
      <BrandSignupPageLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingState />
        </div>
      </BrandSignupPageLayout>
    );
  }

  if (error) {
    return (
      <BrandSignupPageLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive text-center">Error: {error.message}</p>
        </div>
      </BrandSignupPageLayout>
    );
  }

  if (application) {
    return (
      <BrandSignupPageLayout>
        <BrandApplicationStatus application={application} />
      </BrandSignupPageLayout>
    );
  }

  // If there is no application, show the form to create one.
  return (
    <BrandSignupPageLayout>
      <BrandSignupForm />
    </BrandSignupPageLayout>
  );
};

export default BrandSignup;
