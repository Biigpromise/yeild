
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

const FormStepOne = ({ form }: any) => {
  const {
    formState,
    register,
    watch,
  } = form;

  // We need to "watch" password field for live strength feedback.
  const passwordValue = form.watch('password');

  return (
    <>
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter your company name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter your email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password *</FormLabel>
            <FormControl>
              <Input type="password" {...field} placeholder="Choose a password (min 8 chars)" autoComplete="new-password" />
            </FormControl>
            <PasswordStrengthMeter password={passwordValue} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="companySize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Size *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="yeild-input">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website (Optional)</FormLabel>
            <FormControl>
              <Input type="url" placeholder="Enter your website URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormStepOne;
