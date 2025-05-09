
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  step: number;
  isLoading: boolean;
  onBack: () => void;
}

const FormButtons = ({ step, isLoading, onBack }: FormButtonsProps) => {
  return (
    <div className="flex justify-between pt-4">
      {step > 1 && (
        <Button 
          type="button" 
          variant="outline" 
          className="yeild-btn-secondary" 
          onClick={onBack}
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
  );
};

export default FormButtons;
