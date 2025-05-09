
interface ProgressStepsProps {
  step: number;
}

const ProgressSteps = ({ step }: ProgressStepsProps) => {
  return (
    <div className="flex justify-center mb-8">
      <ol className="flex w-full">
        <li className={`flex-1 text-center relative ${step >= 1 ? 'text-yeild-yellow' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full mb-2 flex items-center justify-center ${step >= 1 ? 'bg-yeild-yellow text-yeild-black' : 'bg-gray-800'}`}>
            1
          </div>
          <span className="text-sm">Company Info</span>
        </li>
        <li className={`flex-1 text-center relative ${step >= 2 ? 'text-yeild-yellow' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full mb-2 flex items-center justify-center ${step >= 2 ? 'bg-yeild-yellow text-yeild-black' : 'bg-gray-800'}`}>
            2
          </div>
          <span className="text-sm">Campaign Details</span>
        </li>
      </ol>
    </div>
  );
};

export default ProgressSteps;
