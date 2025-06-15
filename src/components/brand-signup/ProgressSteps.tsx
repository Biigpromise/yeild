
import React from 'react';

interface ProgressStepsProps {
  step: number;
}

const Step = ({ stepNumber, label, isActive }: { stepNumber: number; label: string; isActive: boolean; }) => (
    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 font-bold text-lg ${
                isActive ? "bg-yeild-yellow text-yeild-black" : "bg-gray-800 text-gray-400 border-2 border-gray-700"
            }`}
        >
            {stepNumber}
        </div>
        <div className="mt-2 sm:mt-0 sm:ml-4">
          <h3 className={`text-sm font-semibold leading-none ${isActive ? 'text-white' : 'text-gray-500'}`}>{label}</h3>
        </div>
    </div>
);

const ProgressSteps = ({ step }: ProgressStepsProps) => {
  return (
    <div className="flex items-center justify-center w-full my-8">
        <Step stepNumber={1} label="Company Info" isActive={step >= 1} />
        <div className={`flex-1 h-0.5 max-w-24 mx-2 sm:mx-4 rounded-full transition-colors duration-500 ${step > 1 ? 'bg-yeild-yellow' : 'bg-gray-700'}`} />
        <Step stepNumber={2} label="Campaign Details" isActive={step >= 2} />
    </div>
  );
};

export default ProgressSteps;
