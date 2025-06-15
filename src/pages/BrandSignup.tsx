
import BrandSignupForm from "@/components/brand-signup/BrandSignupForm";
import BrandSignupPageLayout from "@/components/brand-signup/BrandSignupPageLayout";
import { useBrandApplicationStatus } from "@/hooks/useBrandApplicationStatus";
import { BrandApplicationStatus } from "@/components/brand-signup/BrandApplicationStatus";
import { LoadingState } from "@/components/ui/loading-state";
import { useRole } from "@/hooks/useRole";
import BrandDashboard from "@/pages/BrandDashboard";

const BrandSignup = () => {
  const { application, checkingStatus } = useBrandApplicationStatus();
  const { hasRequiredRole: isBrand, loading: roleLoading } = useRole('brand');

  const renderContent = () => {
    if (checkingStatus || roleLoading) {
      return <LoadingState text="Checking application status..." />;
    }

    // If user has 'brand' role and application is approved, show the brand dashboard
    if (isBrand && application?.status === 'approved') {
        return <BrandDashboard />;
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
