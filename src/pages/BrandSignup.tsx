
import BrandApplicationStatus from "@/components/brand-signup/BrandApplicationStatus";

const BrandSignup = () => {
  // We are now rendering the BrandApplicationStatus component, which handles the entire
  // brand signup flow, from application to status checking.
  // This replaces the temporary direct rendering of the BrandDashboard.
  return <BrandApplicationStatus />;
};

export default BrandSignup;
