import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onCheckedChange, id = "termsCheckbox" }) => {
  // Handle label click (excluding interactive children like anchors)
  const handleLabelClick: React.MouseEventHandler<HTMLLabelElement> = (e) => {
    // If clicking on a link, don't toggle
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      return;
    }
    // Otherwise toggle
    onCheckedChange(!checked);
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
        onClick={handleLabelClick}
      >
        I agree to the{" "}
        <a
          href="#"
          className="text-yeild-yellow hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={0}
          onClick={(e) => {
            // allow link to work but not toggle checkbox
            e.stopPropagation();
          }}
        >
          Terms of Service
        </a>
        {" "}and{" "}
        <a
          href="#"
          className="text-yeild-yellow hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Privacy Policy
        </a>
      </Label>
    </div>
  );
};

export default TermsCheckbox;
