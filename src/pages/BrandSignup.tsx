
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";

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
      if (!companyName || !email || !password || !website || !companySize) {
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
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yeild-yellow/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-yeild-yellow" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-gray-300 text-xl mb-8">
              Thank you for your interest in partnering with YEILD
            </p>
            <p className="text-gray-400 mb-8">
              Our team will review your application and get back to you within 2-3 business days. 
              In the meantime, feel free to explore our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="yeild-btn-primary" 
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
              <Button 
                variant="outline" 
                className="yeild-btn-secondary"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                Schedule Demo Call
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
              </div>
              <h1 className="text-2xl font-bold">Brand Partnership Application</h1>
              <p className="text-gray-400 mt-2">Connect with our engaged community of users</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <ol className="flex w-full">
                <li className={`flex-1 text-center relative ${step >= 1 ? 'text-yeild-yellow' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full mb-2 flex items-center justify-center ${step >= 1 ? 'bg-yeild-yellow text-yeild-black' : 'bg-gray-800'}`}>
                    1
                  </div>
                  <span className="text-sm">Company Info</span>
                </li>
                <li className={`flex-1 text-center relative ${step >= 2 ? 'text-yeild-yellow' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full mb-2 flex items-center justify-center ${step >= 2 ? 'bg-yeild-yellow text-yeild-black' : 'bg-gray-800'}`}>
                    2
                  </div>
                  <span className="text-sm">Campaign Details</span>
                </li>
              </ol>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name*</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="yeild-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your business email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="yeild-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Create Password*</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="yeild-input"
                      minLength={8}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Company Website*</Label>
                      <Input
                        id="website"
                        placeholder="https://"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="yeild-input"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size*</Label>
                      <Select value={companySize} onValueChange={setCompanySize}>
                        <SelectTrigger className="yeild-input">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry*</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="yeild-input">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel & Hospitality</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Task Types (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="surveys" 
                          checked={taskTypes.surveys}
                          onCheckedChange={(checked) => 
                            setTaskTypes({...taskTypes, surveys: checked as boolean})
                          }
                        />
                        <label htmlFor="surveys" className="text-sm text-gray-300">Surveys & Feedback</label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="appTesting" 
                          checked={taskTypes.appTesting}
                          onCheckedChange={(checked) => 
                            setTaskTypes({...taskTypes, appTesting: checked as boolean})
                          }
                        />
                        <label htmlFor="appTesting" className="text-sm text-gray-300">App/Website Testing</label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="contentCreation" 
                          checked={taskTypes.contentCreation}
                          onCheckedChange={(checked) => 
                            setTaskTypes({...taskTypes, contentCreation: checked as boolean})
                          }
                        />
                        <label htmlFor="contentCreation" className="text-sm text-gray-300">Content Creation</label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="productReviews" 
                          checked={taskTypes.productReviews}
                          onCheckedChange={(checked) => 
                            setTaskTypes({...taskTypes, productReviews: checked as boolean})
                          }
                        />
                        <label htmlFor="productReviews" className="text-sm text-gray-300">Product Reviews</label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="focusGroups" 
                          checked={taskTypes.focusGroups}
                          onCheckedChange={(checked) => 
                            setTaskTypes({...taskTypes, focusGroups: checked as boolean})
                          }
                        />
                        <label htmlFor="focusGroups" className="text-sm text-gray-300">Focus Groups</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget*</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="yeild-input">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000+">$10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goals">Campaign Goals*</Label>
                    <Textarea
                      id="goals"
                      placeholder="What are your primary objectives for working with YEILD?"
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      className="yeild-input min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <div 
                      className="cursor-pointer flex items-center space-x-2" 
                      onClick={() => setAgreeTerms(!agreeTerms)}
                    >
                      <Checkbox 
                        id="terms" 
                        checked={agreeTerms}
                        onCheckedChange={() => setAgreeTerms(!agreeTerms)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-gray-400 cursor-pointer"
                      >
                        I agree to the <a href="#" className="text-yeild-yellow hover:underline">Terms of Service</a> and <a href="#" className="text-yeild-yellow hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="yeild-btn-secondary" 
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className={`yeild-btn-primary ${step === 1 ? 'w-full' : ''}`} 
                  disabled={isLoading}
                >
                  {isLoading 
                    ? "Processing..." 
                    : step < 2 
                      ? "Continue" 
                      : "Submit Application"
                  }
                </Button>
              </div>
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
