
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";

interface TermsCheckboxProps {
  field: ControllerRenderProps<any, "agreeTerms">;
  id?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ 
  field, 
  id = "termsCheckbox" 
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    window.open(e.currentTarget.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="items-top flex space-x-3 mt-4 p-3 border border-gray-800 rounded-lg bg-gray-900/30">
      <Checkbox
        id={id}
        checked={field.value}
        onCheckedChange={field.onChange}
        aria-describedby={`${id}-description`}
      />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} id={`${id}-description`} className="text-sm text-gray-300 font-normal cursor-pointer">
          I agree to the{" "}
          <a
            href="/terms-of-service"
            className="font-medium text-yeild-yellow hover:underline"
            onClick={handleLinkClick}
          >
            Terms of Service
          </a>
          {" "}and{" "}
          <a
            href="/privacy-policy"
            className="font-medium text-yeild-yellow hover:underline"
            onClick={handleLinkClick}
          >
            Privacy Policy
          </a>
          .
        </Label>
      </div>
    </div>
  );
};

export default TermsCheckbox;
