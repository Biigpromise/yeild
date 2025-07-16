
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import UserTypeSelection from "./UserTypeSelection";
import MetaStyleLoginForm from "./MetaStyleLoginForm";

const AuthFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleWelcomeNext = () => {
    setCurrentStep(1);
  };

  const handleSelectUser = () => {
    setCurrentStep(2);
  };

  const handleSelectBrand = () => {
    navigate("/brand-signup");
  };

  const handleSwitchToSignin = () => {
    setCurrentStep(2); // Or navigate to signin flow
  };

  const handleBackToUserTypeSelection = () => {
    setCurrentStep(1);
  };

  switch (currentStep) {
    case 0:
      return <WelcomePage onNext={handleWelcomeNext} />;
    case 1:
      return <UserTypeSelection onSelectUser={handleSelectUser} onSelectBrand={handleSelectBrand} onSwitchToSignin={handleSwitchToSignin} />;
    case 2:
      return <MetaStyleLoginForm onBack={handleBackToUserTypeSelection} />;
    default:
      return <WelcomePage onNext={handleWelcomeNext} />;
  }
};

export default AuthFlow;
