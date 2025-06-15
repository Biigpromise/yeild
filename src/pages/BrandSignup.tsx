
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import FormStepOne from "@/components/brand-signup/FormStepOne";
import FormStepTwo from "@/components/brand-signup/FormStepTwo";
import SuccessMessage from "@/components/brand-signup/SuccessMessage";
import ProgressSteps from "@/components/brand-signup/ProgressSteps";
import FormButtons from "@/components/brand-signup/FormButtons";

const BrandSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formCompleted, setFormCompleted] = useState(false);

  // Form values
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [taskTypes, setTaskTypes] = useState({
    surveys: false,
    appTesting: false,
    contentCreation: false,
    productReviews: false,
    focusGroups: false
  });
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!companyName || !email || !password || !companySize) {
        toast.error("Please fill out all required fields");
        return;
      }
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!industry || !budget || !goals) {
        toast.error("Please fill out all required fields");
        return;
      }
      
      if (!agreeTerms) {
        toast.error("Please agree to the Terms and Privacy Policy");
        return;
      }
      
      setIsLoading(true);
      
      // Simulate API call
      try {
        // In a real app, this would be an API call to register the brand
        setTimeout(() => {
          setFormCompleted(true);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-2xl p-6">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        {formCompleted ? (
          <SuccessMessage />
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
              </div>
              <h1 className="text-2xl font-bold">Brand Partnership Application</h1>
              <p className="text-gray-400 mt-2">Connect with our engaged community of users</p>
            </div>
            
            <ProgressSteps step={step} />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <FormStepOne 
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  website={website}
                  setWebsite={setWebsite}
                  companySize={companySize}
                  setCompanySize={setCompanySize}
                />
              )}
              
              {step === 2 && (
                <FormStepTwo 
                  industry={industry}
                  setIndustry={setIndustry}
                  taskTypes={taskTypes}
                  setTaskTypes={setTaskTypes}
                  budget={budget}
                  setBudget={setBudget}
                  goals={goals}
                  setGoals={setGoals}
                  agreeTerms={agreeTerms}
                  setAgreeTerms={setAgreeTerms}
                />
              )}
              
              <FormButtons 
                step={step} 
                isLoading={isLoading} 
                onBack={() => setStep(step - 1)} 
              />
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have a brand account?{" "}
                <Link to="/login" className="text-yeild-yellow hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandSignup;
