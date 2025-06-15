
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onCheckedChange, id = "termsCheckbox" }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent the label from toggling the checkbox.
    e.preventDefault();
    // Stop the event from propagating further up the DOM tree.
    e.stopPropagation();
    // Manually open the link in a new tab.
    window.open(e.currentTarget.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-start mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900/50 select-none">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1 flex-shrink-0"
        tabIndex={0}
        aria-describedby={`${id}-description`}
      />
      <Label
        htmlFor={id}
        className="flex-1 ml-3 cursor-pointer text-sm text-gray-300 leading-relaxed select-none"
      >
        I agree to the{" "}
        <a
          href="/terms-of-service"
          className="text-yeild-yellow hover:underline"
          onClick={handleLinkClick}
          tabIndex={0}
        >
          Terms of Service
        </a>
        {" "}and{" "}
        <a
          href="/privacy-policy"
          className="text-yeild-yellow hover:underline"
          onClick={handleLinkClick}
          tabIndex={0}
        >
          Privacy Policy
        </a>
      </Label>
    </div>
  );
};

export default TermsCheckbox;
