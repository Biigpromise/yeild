
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { checkFieldUniqueness } from "@/services/brandSignupValidation";
import { useFormPersistence } from "@/hooks/useFormPersistence";

const formSchema = z
  .object({
    companyName: z.string().min(1, { message: "Company name is required." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    companySize: z.string().min(1, { message: "Please select a company size." }),
    industry: z.string().min(1, { message: "Please select your industry." }),
    taskTypes: z.object({
      surveys: z.boolean().default(false),
      appTesting: z.boolean().default(false),
      contentCreation: z.boolean().default(false),
      productReviews: z.boolean().default(false),
      focusGroups: z.boolean().default(false),
    }).default({}),
    budget: z.string().min(1, { message: "Please select a budget (minimum $10)." }),
    goals: z.string().min(1, { message: "Please describe your campaign goals." }),
    agreeTerms: z.boolean(),
  })
  .refine(data => data.agreeTerms, {
    message: "You must agree to the Terms of Service and Privacy Policy.",
    path: ["agreeTerms"],
  });

export type BrandSignupFormValues = z.infer<typeof formSchema>;

export function useBrandSignupForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submittedCompany, setSubmittedCompany] = useState<string | null>(null);

  // --- Ref caches to prevent spamming Supabase when users keep typing ---
  const companyNameCheckRef = useRef<{ value: string; exists: boolean | undefined }>({ value: "", exists: undefined });
  const emailCheckRef = useRef<{ value: string; exists: boolean | undefined }>({ value: "", exists: undefined });

  const form = useForm<BrandSignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
      website: "",
      companySize: "",
      industry: "",
      taskTypes: {
        surveys: false,
        appTesting: false,
        contentCreation: false,
        productReviews: false,
        focusGroups: false,
      },
      budget: "$10-50", // Updated default minimum budget
      goals: "",
      agreeTerms: false,
    },
    mode: "onChange",
  });

  const {
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = form;

  const companyNameValue = watch("companyName");
  const emailValue = watch("email");

  // Effect for live company name validation
  useEffect(() => {
    if (!companyNameValue || companyNameValue.length < 2) return;
    let debounce: NodeJS.Timeout;
    debounce = setTimeout(async () => {
      if (
        companyNameCheckRef.current.value === companyNameValue &&
        companyNameCheckRef.current.exists !== undefined
      ) {
        if (companyNameCheckRef.current.exists) {
          setError("companyName", { type: "manual", message: "A company with this name already exists." });
        } else {
          clearErrors("companyName");
        }
        return;
      }
      const exists = await checkFieldUniqueness("companyName", companyNameValue);
      companyNameCheckRef.current = { value: companyNameValue, exists };
      if (exists) {
        setError("companyName", { type: "manual", message: "A company with this name already exists." });
      } else {
        clearErrors("companyName");
      }
    }, 600);
    return () => clearTimeout(debounce);
  }, [companyNameValue, setError, clearErrors]);

  useEffect(() => {
    if (!emailValue || !/^[^@]+@[^@]+\.[^@]+/.test(emailValue)) return;
    let debounce: NodeJS.Timeout;
    debounce = setTimeout(async () => {
      if (
        emailCheckRef.current.value === emailValue &&
        emailCheckRef.current.exists !== undefined
      ) {
        if (emailCheckRef.current.exists) {
          setError("email", { type: "manual", message: "This email is already registered." });
        } else {
          clearErrors("email");
        }
        return;
      }
      const exists = await checkFieldUniqueness("email", emailValue);
      emailCheckRef.current = { value: emailValue, exists };
      if (exists) {
        setError("email", { type: "manual", message: "This email is already registered." });
      } else {
        clearErrors("email");
      }
    }, 600);
    return () => clearTimeout(debounce);
  }, [emailValue, setError, clearErrors]);

  // Use the generic hook to persist brand signup form
  const { clearDraft } = useFormPersistence(form, "brandSignupFormDraft", true);

  return {
    form,
    step,
    setStep,
    submitted,
    setSubmitted,
    submittedEmail,
    setSubmittedEmail,
    submittedCompany,
    setSubmittedCompany,
    clearDraft,
  };
}
