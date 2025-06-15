
import React from "react";

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

  const handleCheckboxClick = () => {
    console.log("Checkbox clicked, toggling from:", checked, "to:", !checked);
    onCheckedChange(!checked);
  };

  return (
    <div className="flex items-start mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
      {/* Custom checkbox that only responds to direct clicks */}
      <div
        className="mt-1 flex-shrink-0 w-4 h-4 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
        style={{
          backgroundColor: checked ? '#3b82f6' : 'transparent',
          borderColor: checked ? '#3b82f6' : '#d1d5db'
        }}
        onClick={handleCheckboxClick}
        role="checkbox"
        aria-checked={checked}
        aria-describedby={`${id}-description`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCheckboxClick();
          }
        }}
      >
        {checked && (
          <svg 
            className="w-3 h-3 text-white" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
      
      {/* Text area that cannot be clicked */}
      <div
        id={`${id}-description`}
        className="flex-1 ml-3 text-sm text-gray-300 leading-relaxed select-none"
        style={{ pointerEvents: 'none' }}
      >
        I agree to the{" "}
        <a
          href="/terms-of-service"
          className="text-yeild-yellow hover:underline"
          onClick={handleLinkClick}
          style={{ pointerEvents: 'auto' }}
        >
          Terms of Service
        </a>
        {" "}and{" "}
        <a
          href="/privacy-policy"
          className="text-yeild-yellow hover:underline"
          onClick={handleLinkClick}
          style={{ pointerEvents: 'auto' }}
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default TermsCheckbox;
