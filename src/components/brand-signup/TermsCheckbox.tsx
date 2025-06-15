
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ 
  checked, 
  onCheckedChange, 
  id = "termsCheckbox" 
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(e.currentTarget.href, "_blank", "noopener,noreferrer");
  };

  const handleCheckboxChange = (checkedValue: boolean | "indeterminate") => {
    console.log("Checkbox clicked, new value:", checkedValue);
    onCheckedChange(checkedValue === true);
  };

  return (
    <div className="flex items-start mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckboxChange}
        className="mt-1 flex-shrink-0"
        aria-describedby={`${id}-description`}
      />
      <div
        id={`${id}-description`}
        className="flex-1 ml-3 text-sm text-gray-300 leading-relaxed pointer-events-none select-none"
      >
        I agree to the{" "}
        <a
          href="/terms-of-service"
          className="text-yeild-yellow hover:underline pointer-events-auto"
          onClick={handleLinkClick}
        >
          Terms of Service
        </a>
        {" "}and{" "}
        <a
          href="/privacy-policy"
          className="text-yeild-yellow hover:underline pointer-events-auto"
          onClick={handleLinkClick}
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default TermsCheckbox;
