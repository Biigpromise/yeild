import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskTypes {
  surveys: boolean;
  appTesting: boolean;
  contentCreation: boolean;
  productReviews: boolean;
  focusGroups: boolean;
}

interface FormStepTwoProps {
  industry: string;
  setIndustry: (value: string) => void;
  taskTypes: TaskTypes;
  setTaskTypes: (value: TaskTypes) => void;
  budget: string;
  setBudget: (value: string) => void;
  goals: string;
  setGoals: (value: string) => void;
  agreeTerms: boolean;
  setAgreeTerms: (value: boolean) => void;
}

const FormStepTwo = ({
  industry,
  setIndustry,
  taskTypes,
  setTaskTypes,
  budget,
  setBudget,
  goals,
  setGoals,
  agreeTerms,
  setAgreeTerms
}: FormStepTwoProps) => {
  return (
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
                setTaskTypes({...taskTypes, surveys: checked === true})
              }
            />
            <label htmlFor="surveys" className="text-sm text-gray-300">Surveys & Feedback</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="appTesting" 
              checked={taskTypes.appTesting}
              onCheckedChange={(checked) => 
                setTaskTypes({...taskTypes, appTesting: checked === true})
              }
            />
            <label htmlFor="appTesting" className="text-sm text-gray-300">App/Website Testing</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="contentCreation" 
              checked={taskTypes.contentCreation}
              onCheckedChange={(checked) => 
                setTaskTypes({...taskTypes, contentCreation: checked === true})
              }
            />
            <label htmlFor="contentCreation" className="text-sm text-gray-300">Content Creation</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="productReviews" 
              checked={taskTypes.productReviews}
              onCheckedChange={(checked) => 
                setTaskTypes({...taskTypes, productReviews: checked === true})
              }
            />
            <label htmlFor="productReviews" className="text-sm text-gray-300">Product Reviews</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="focusGroups" 
              checked={taskTypes.focusGroups}
              onCheckedChange={(checked) => 
                setTaskTypes({...taskTypes, focusGroups: checked === true})
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
      
      <div className="flex items-start space-x-3 mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
        <label 
          htmlFor="termsCheckbox" 
          className="flex items-start space-x-3 w-full cursor-pointer"
        >
          <Checkbox
            id="termsCheckbox"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            className="mt-1 flex-shrink-0"
            tabIndex={0}
          />
          <span className="flex-1 text-sm text-gray-300 leading-relaxed select-none">
            I agree to the{" "}
            <a
              href="#"
              className="text-yeild-yellow hover:underline"
              tabIndex={0}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              Terms of Service
            </a>
            {" "}and{" "}
            <a
              href="#"
              className="text-yeild-yellow hover:underline"
              tabIndex={0}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
    </>
  );
};

export default FormStepTwo;
