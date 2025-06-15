
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TermsCheckbox from "./TermsCheckbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface FormStepTwoProps {
  form: UseFormReturn<any>;
}

const taskOptions = [
  { id: 'surveys', label: 'Surveys & Feedback' },
  { id: 'appTesting', label: 'App/Website Testing' },
  { id: 'contentCreation', label: 'Content Creation' },
  { id: 'productReviews', label: 'Product Reviews' },
  { id: 'focusGroups', label: 'Focus Groups' },
];

const FormStepTwo = ({ form }: FormStepTwoProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="yeild-input">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="taskTypes"
        render={() => (
          <FormItem>
            <FormLabel>Task Types (Select all that apply)</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {taskOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={`taskTypes.${item.id}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-gray-300">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Budget*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="yeild-input">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="10000+">$10,000+</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign Goals*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What are your primary objectives for working with YEILD?"
                {...field}
                className="yeild-input min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TermsCheckbox field={field} />
            </FormControl>
            <FormMessage className="pl-4" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FormStepTwo;
