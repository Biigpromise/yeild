
import BrandSignupForm from "@/components/brand-signup/BrandSignupForm";
import BrandSignupPageLayout from "@/components/brand-signup/BrandSignupPageLayout";
import { useBrandApplicationStatus } from "@/hooks/useBrandApplicationStatus";
import { BrandApplicationStatus } from "@/components/brand-signup/BrandApplicationStatus";
import { LoadingState } from "@/components/ui/loading-state";

const BrandSignup = () => {
  const { application, checkingStatus } = useBrandApplicationStatus();

  const renderContent = () => {
    if (checkingStatus) {
      return <LoadingState text="Checking application status..." />;
    }
    if (application) {
      return <BrandApplicationStatus application={application} />;
    }
    return <BrandSignupForm />;
  };

  return (
    <BrandSignupPageLayout>
      {renderContent()}
    </BrandSignupPageLayout>
  );
};

export default BrandSignup;
